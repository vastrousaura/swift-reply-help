-- Create enum types for ticket statuses and priorities
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE public.ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.user_role AS ENUM ('user', 'agent', 'admin');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create ticket categories table
CREATE TABLE public.ticket_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6B7280',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ticket categories
ALTER TABLE public.ticket_categories ENABLE ROW LEVEL SECURITY;

-- Create tickets table
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'open',
  priority ticket_priority NOT NULL DEFAULT 'medium',
  category_id UUID REFERENCES public.ticket_categories(id),
  created_by UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  attachment_url TEXT,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on tickets
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Create ticket comments table
CREATE TABLE public.ticket_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ticket comments
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;

-- Create ticket votes table
CREATE TABLE public.ticket_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ticket_id, user_id)
);

-- Enable RLS on ticket votes
ALTER TABLE public.ticket_votes ENABLE ROW LEVEL SECURITY;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ticket_comments_updated_at
  BEFORE UPDATE ON public.ticket_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create helper function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_name user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = $1 AND profiles.role = $2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for ticket categories
CREATE POLICY "Everyone can view categories" ON public.ticket_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.ticket_categories
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for tickets
CREATE POLICY "Users can view tickets they created or are assigned to" ON public.tickets
  FOR SELECT USING (
    created_by = auth.uid() OR 
    assigned_to = auth.uid() OR 
    public.has_role(auth.uid(), 'agent') OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can create tickets" ON public.tickets
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Agents and admins can update tickets" ON public.tickets
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'agent') OR 
    public.has_role(auth.uid(), 'admin') OR
    created_by = auth.uid()
  );

-- RLS Policies for ticket comments
CREATE POLICY "Users can view comments for tickets they have access to" ON public.ticket_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets 
      WHERE tickets.id = ticket_id AND (
        tickets.created_by = auth.uid() OR 
        tickets.assigned_to = auth.uid() OR 
        public.has_role(auth.uid(), 'agent') OR 
        public.has_role(auth.uid(), 'admin')
      )
    )
  );

CREATE POLICY "Users can create comments on accessible tickets" ON public.ticket_comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.tickets 
      WHERE tickets.id = ticket_id AND (
        tickets.created_by = auth.uid() OR 
        tickets.assigned_to = auth.uid() OR 
        public.has_role(auth.uid(), 'agent') OR 
        public.has_role(auth.uid(), 'admin')
      )
    )
  );

-- RLS Policies for ticket votes
CREATE POLICY "Users can view votes" ON public.ticket_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can vote on tickets they can access" ON public.ticket_votes
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.tickets 
      WHERE tickets.id = ticket_id AND (
        tickets.created_by = auth.uid() OR 
        tickets.assigned_to = auth.uid() OR 
        public.has_role(auth.uid(), 'agent') OR 
        public.has_role(auth.uid(), 'admin')
      )
    )
  );

CREATE POLICY "Users can update their own votes" ON public.ticket_votes
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own votes" ON public.ticket_votes
  FOR DELETE USING (user_id = auth.uid());

-- Insert default ticket categories
INSERT INTO public.ticket_categories (name, description, color) VALUES
  ('Technical Support', 'Technical issues and troubleshooting', '#3B82F6'),
  ('Account & Billing', 'Account-related questions and billing issues', '#10B981'),
  ('Feature Request', 'Requests for new features or improvements', '#8B5CF6'),
  ('Bug Report', 'Report bugs and software issues', '#EF4444'),
  ('General Inquiry', 'General questions and other topics', '#6B7280');

-- Create function to update ticket vote counts
CREATE OR REPLACE FUNCTION public.update_ticket_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'up' THEN
      UPDATE public.tickets SET upvotes = upvotes + 1 WHERE id = NEW.ticket_id;
    ELSE
      UPDATE public.tickets SET downvotes = downvotes + 1 WHERE id = NEW.ticket_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type = 'up' AND NEW.vote_type = 'down' THEN
      UPDATE public.tickets SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = NEW.ticket_id;
    ELSIF OLD.vote_type = 'down' AND NEW.vote_type = 'up' THEN
      UPDATE public.tickets SET downvotes = downvotes - 1, upvotes = upvotes + 1 WHERE id = NEW.ticket_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE public.tickets SET upvotes = upvotes - 1 WHERE id = OLD.ticket_id;
    ELSE
      UPDATE public.tickets SET downvotes = downvotes - 1 WHERE id = OLD.ticket_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vote count updates
CREATE TRIGGER update_ticket_vote_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.ticket_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_ticket_vote_counts();