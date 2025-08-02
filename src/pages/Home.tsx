import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MessageSquare, 
  Users, 
  Zap, 
  Shield, 
  CheckCircle, 
  ArrowRight,
  BarChart3,
  Clock,
  Bell
} from 'lucide-react';

export const Home = () => {
  const features = [
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: 'Easy Ticket Management',
      description: 'Create, track, and resolve support tickets with our intuitive interface.',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Team Collaboration',
      description: 'Seamlessly collaborate with your support team to resolve issues faster.',
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Lightning Fast',
      description: 'Built for speed and efficiency to keep your support team productive.',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security to protect your data and customer information.',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Analytics & Insights',
      description: 'Track performance metrics and gain insights into your support operations.',
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: 'Smart Notifications',
      description: 'Stay updated with real-time notifications and email alerts.',
    },
  ];

  const benefits = [
    'Reduce response times by up to 60%',
    'Increase customer satisfaction scores',
    'Streamline support workflows',
    'Scale your support operations',
    'Integrate with existing tools',
    'Access detailed analytics',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="gradient-primary h-8 w-8 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">QD</span>
              </div>
              <span className="text-xl font-bold">QuickDesk</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
              Streamline Your
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}Support Operations
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              QuickDesk is a simple, easy-to-use AI-powered help desk solution that helps teams 
              manage support tickets efficiently and deliver exceptional customer experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="px-8">
                <Link to="/auth">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built with modern teams in mind, QuickDesk provides all the tools you need 
              to deliver outstanding customer support.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Transform your support experience
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of teams who have revolutionized their customer support 
                with QuickDesk's powerful yet simple platform.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-base">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Card className="p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Average Response Time</h3>
                      <p className="text-2xl font-bold text-green-600">2.5 hours</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Customer Satisfaction</h3>
                      <p className="text-2xl font-bold text-green-600">98.5%</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Tickets Resolved</h3>
                      <p className="text-2xl font-bold text-green-600">10,000+</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to transform your support?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of teams already using QuickDesk to deliver exceptional customer support.
          </p>
          <Button size="lg" variant="secondary" asChild className="px-8">
            <Link to="/auth">
              Get Started Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="gradient-primary h-8 w-8 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">QD</span>
              </div>
              <span className="text-xl font-bold">QuickDesk</span>
            </div>
            <p className="text-muted-foreground">
              © 2025 QuickDesk. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};