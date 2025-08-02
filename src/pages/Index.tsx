import React, { useState, useEffect } from 'react';
import { DynamicHeader } from '@/components/DynamicHeader';
import { TicketCard, Ticket } from '@/components/TicketCard';
import { CreateTicketDialog } from '@/components/CreateTicketDialog';

// Sample tickets for demonstration
const initialTickets: Ticket[] = [
  {
    id: '1',
    title: 'User authentication not working',
    description: 'Users are unable to log in to the system. The authentication service appears to be down.',
    status: 'open',
    priority: 'high',
    assignee: 'John Doe',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'Dashboard loading slowly',
    description: 'The main dashboard takes more than 10 seconds to load, causing poor user experience.',
    status: 'in-progress',
    priority: 'medium',
    assignee: 'Jane Smith',
    createdAt: new Date('2024-01-14'),
  },
  {
    id: '3',
    title: 'Mobile app crashes on startup',
    description: 'iOS users report that the app crashes immediately upon opening.',
    status: 'resolved',
    priority: 'urgent',
    assignee: 'Mike Johnson',
    createdAt: new Date('2024-01-13'),
  },
];

const Index = () => {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleCreateTicket = (newTicketData: Omit<Ticket, 'id' | 'createdAt'>) => {
    const newTicket: Ticket = {
      ...newTicketData,
      id: `ticket-${Date.now()}`,
      createdAt: new Date(),
    };

    // Add new ticket to the beginning of the array (stack behavior)
    setTickets(prev => [newTicket, ...prev]);
  };

  // Remove the 'isNew' flag after animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setTickets(prev => prev.map(ticket => ({ ...ticket, isNew: false })));
    }, 500);

    return () => clearTimeout(timer);
  }, [tickets]);

  return (
    <div className="min-h-screen bg-background">
      <DynamicHeader onCreateTicket={() => setCreateDialogOpen(true)} />
      
      {/* Main content */}
      <main className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="space-y-6">
          {tickets.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold text-muted-foreground mb-4">
                No tickets yet
              </h2>
              <p className="text-muted-foreground">
                Create your first ticket to get started
              </p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-card rounded-lg p-4 shadow-soft text-center">
                  <div className="text-2xl font-bold text-primary">{tickets.length}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="bg-card rounded-lg p-4 shadow-soft text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {tickets.filter(t => t.status === 'open').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Open</div>
                </div>
                <div className="bg-card rounded-lg p-4 shadow-soft text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {tickets.filter(t => t.status === 'in-progress').length}
                  </div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
                <div className="bg-card rounded-lg p-4 shadow-soft text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {tickets.filter(t => t.status === 'resolved').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Resolved</div>
                </div>
              </div>

              {/* Tickets stack */}
              <div className="space-y-4">
                {tickets.map((ticket, index) => (
                  <TicketCard 
                    key={ticket.id} 
                    ticket={ticket} 
                    index={index}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <CreateTicketDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateTicket={handleCreateTicket}
      />
    </div>
  );
};

export default Index;
