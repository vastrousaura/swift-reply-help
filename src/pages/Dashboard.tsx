import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  TicketIcon, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus,
  Search,
  Filter,
  TrendingUp,
  Users,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to: string | null;
  category: {
    name: string;
    color: string;
  } | null;
  creator: {
    display_name: string;
    email: string;
  };
  assignee: {
    display_name: string;
    email: string;
  } | null;
}

export const Dashboard = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('tickets')
        .select(`
          *,
          category:ticket_categories(name, color),
          creator:profiles!tickets_created_by_fkey(display_name, email),
          assignee:profiles!tickets_assigned_to_fkey(display_name, email)
        `)
        .order('created_at', { ascending: false });

      // Filter based on user role
      if (profile?.role === 'user') {
        query = query.eq('created_by', profile.user_id);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setTickets(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch tickets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [profile]);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { label: 'Open', className: 'status-open' },
      in_progress: { label: 'In Progress', className: 'status-progress' },
      resolved: { label: 'Resolved', className: 'status-resolved' },
      closed: { label: 'Closed', className: 'status-closed' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={`status-badge ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { label: 'Low', className: 'priority-low' },
      medium: { label: 'Medium', className: 'priority-medium' },
      high: { label: 'High', className: 'priority-high' },
      urgent: { label: 'Urgent', className: 'priority-urgent' },
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return (
      <Badge className={`priority-badge ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  const getStats = () => {
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in_progress').length;
    const resolved = tickets.filter(t => t.status === 'resolved').length;
    const closed = tickets.filter(t => t.status === 'closed').length;
    
    return { open, inProgress, resolved, closed, total: tickets.length };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {profile?.display_name}
            </p>
          </div>
          <Button asChild>
            <Link to="/tickets/new">
              <Plus className="mr-2 h-4 w-4" />
              New Ticket
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <TicketIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filter Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tickets List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Tickets</CardTitle>
            <CardDescription>
              {filteredTickets.length} of {tickets.length} tickets
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTickets.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No tickets found</h3>
                <p className="text-muted-foreground mb-4">
                  {tickets.length === 0 
                    ? "You haven't created any tickets yet." 
                    : "No tickets match your current filters."
                  }
                </p>
                <Button asChild>
                  <Link to="/tickets/new">Create Your First Ticket</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                  <Link key={ticket.id} to={`/tickets/${ticket.id}`}>
                    <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{ticket.subject}</h3>
                            {ticket.category && (
                              <Badge 
                                variant="outline" 
                                style={{ borderColor: ticket.category.color, color: ticket.category.color }}
                              >
                                {ticket.category.name}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {ticket.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Created by {ticket.creator.display_name}</span>
                            <span>•</span>
                            <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                            {ticket.assignee && (
                              <>
                                <span>•</span>
                                <span>Assigned to {ticket.assignee.display_name}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 ml-4">
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};