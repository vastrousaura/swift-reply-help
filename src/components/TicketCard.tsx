import React from 'react';
import { Clock, User, Tag, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  createdAt: Date;
  isNew?: boolean;
}

interface TicketCardProps {
  ticket: Ticket;
  index: number;
}

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return <ArrowUp className="h-3 w-3 text-destructive" />;
    case 'high':
      return <ArrowUp className="h-3 w-3 text-orange-500" />;
    case 'medium':
      return <Minus className="h-3 w-3 text-yellow-500" />;
    case 'low':
      return <ArrowDown className="h-3 w-3 text-green-500" />;
    default:
      return <Minus className="h-3 w-3 text-muted-foreground" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'in-progress':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'resolved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'closed':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, index }) => {
  return (
    <div 
      className={`group relative bg-card border rounded-xl p-6 shadow-soft hover:shadow-elevated transition-all duration-300 cursor-pointer ${
        ticket.isNew ? 'animate-pop-in' : 'animate-fade-in'
      }`}
      style={{ 
        animationDelay: ticket.isNew ? '0ms' : `${index * 100}ms`,
        transformOrigin: 'top center'
      }}
    >
      {/* Priority indicator */}
      <div className="absolute top-4 right-4 flex items-center space-x-1">
        {getPriorityIcon(ticket.priority)}
        <span className="text-xs text-muted-foreground capitalize">{ticket.priority}</span>
      </div>

      {/* Main content */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {ticket.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
            {ticket.description}
          </p>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{ticket.assignee}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{ticket.createdAt.toLocaleDateString()}</span>
            </div>
          </div>
          
          <Badge 
            variant="outline" 
            className={`text-xs ${getStatusColor(ticket.status)}`}
          >
            <Tag className="h-3 w-3 mr-1" />
            {ticket.status.replace('-', ' ')}
          </Badge>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};