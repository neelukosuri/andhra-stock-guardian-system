
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Lock, LogIn, Shield } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

const formSchema = z.object({
  username: z.string().min(3, {
    message: 'Username must be at least 3 characters.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
});

interface LoginProps {
  onLogin: (user: {
    id: string;
    username: string;
    role: 'HQ_ADMIN' | 'DISTRICT_ADMIN';
    districtId?: string;
  }) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const { toast } = useToast();
  const { users, districts } = useData();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    // Check for existing user in our mock data
    const user = users.find(
      u => u.username === values.username && u.password === values.password && u.isActive
    );

    setTimeout(() => {
      setIsLoading(false);
      
      if (user) {
        toast({
          title: "Login successful",
          description: `Welcome, ${user.username}!`,
        });
        
        // Pass authenticated user data to the parent component
        onLogin({
          id: user.id,
          username: user.username,
          role: user.role,
          districtId: user.districtId
        });
      } else {
        toast({
          title: "Login failed",
          description: "Invalid username or password.",
          variant: "destructive",
        });
      }
    }, 1000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-[#1A3A67]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A3A67] mb-2">AP Police Communications</h1>
          <p className="text-gray-600">Store Inventory Management System</p>
        </div>
        
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-semibold text-center">Sign in</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your username" 
                          {...field} 
                          disabled={isLoading}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          disabled={isLoading}
                          className="h-11" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full h-11" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign in
                    </span>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Forgot your password? </span>
              <a href="#" className="text-primary hover:underline">Reset it here</a>
            </div>
            <div className="flex items-center justify-center text-xs text-muted-foreground">
              <Lock className="h-3 w-3 mr-1" />
              Secured by AP Police IT Department
            </div>
          </CardFooter>
        </Card>
        
        <p className="text-center text-xs text-muted-foreground mt-8">
          &copy; {new Date().getFullYear()} Andhra Pradesh Police Communications. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
