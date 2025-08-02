import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Bell, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DynamicHeaderProps {
  onCreateTicket: () => void;
}

export const DynamicHeader: React.FC<DynamicHeaderProps> = ({ onCreateTicket }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        scrolled 
          ? 'mx-4 mt-4 rounded-full bg-card/80 backdrop-blur-xl border shadow-floating' 
          : 'bg-background/80 backdrop-blur-xl border-b'
      }`}
    >
      <div className={`flex items-center justify-between transition-all duration-500 ${
        scrolled ? 'px-6 py-3' : 'px-8 py-4'
      }`}>
        
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <h1 className={`font-semibold text-foreground transition-all duration-500 ${
            scrolled ? 'text-lg' : 'text-2xl'
          }`}>
            Tickets
          </h1>
          {!scrolled && (
            <div className="relative animate-fade-in">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search tickets..." 
                className="pl-10 w-64 bg-muted/50 border-0"
              />
            </div>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2">
          {!scrolled && (
            <div className="flex items-center space-x-2 animate-fade-in">
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <Button 
            onClick={onCreateTicket}
            className={`transition-all duration-500 ${
              scrolled 
                ? 'h-10 px-4 rounded-full' 
                : 'h-10 px-6'
            }`}
          >
            <Plus className="h-4 w-4 mr-2" />
            {scrolled ? '' : 'New Ticket'}
          </Button>

          {!scrolled && (
            <Button variant="ghost" size="sm" className="animate-fade-in">
              <User className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};