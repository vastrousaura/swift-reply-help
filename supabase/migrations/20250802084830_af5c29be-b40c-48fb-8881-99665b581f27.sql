-- Fix security warnings by setting proper search paths for functions

-- Update the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update the handle_new_user function  
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Update the has_role function
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_name user_role)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = $1 AND profiles.role = $2
  );
END;
$$;

-- Update the update_ticket_vote_counts function
CREATE OR REPLACE FUNCTION public.update_ticket_vote_counts()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;