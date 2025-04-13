import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookText, ArrowRight } from "lucide-react";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  fullName: z.string().optional(),
});

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user, login, signup } = useAuth();
  const [, navigate] = useLocation();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
    },
  });

  // Handle login form submission
  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      await login(values.username, values.password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  // Handle registration form submission
  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      await signup(values);
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Left side - Forms */}
      <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
        <div className="mb-8 flex items-center">
          <BookText className="h-8 w-8 text-primary" />
          <span className="ml-2 text-xl font-bold text-gray-900 font-poppins">
            Prompt<span className="text-primary">2Book</span>
          </span>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm">
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Welcome back</h2>
                <p className="text-gray-500 mt-1">Log in to your Prompt2Book account</p>
              </div>

              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Login <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Don't have an account?{" "}
                  <button 
                    onClick={() => setActiveTab("register")} 
                    className="text-primary font-medium hover:underline"
                  >
                    Register
                  </button>
                </p>
              </div>
            </TabsContent>

            <TabsContent value="register">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Create an account</h2>
                <p className="text-gray-500 mt-1">Join Prompt2Book to create amazing books</p>
              </div>

              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Choose a username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Create a password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Register <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Already have an account?{" "}
                  <button 
                    onClick={() => setActiveTab("login")} 
                    className="text-primary font-medium hover:underline"
                  >
                    Login
                  </button>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-r from-primary-50 to-primary-100 p-10 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Transform your ideas into beautifully formatted books
          </h2>
          <p className="text-gray-700 mb-6">
            Prompt2Book helps you create professional books from simple text prompts using AI.
            No design skills or technical knowledge required.
          </p>
          <ul className="space-y-3">
            <li className="flex items-center">
              <div className="bg-white rounded-full p-1 mr-3">
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
              <span className="text-gray-700">Generate complete books from text prompts</span>
            </li>
            <li className="flex items-center">
              <div className="bg-white rounded-full p-1 mr-3">
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
              <span className="text-gray-700">Export in multiple formats (PDF, EPUB, DOCX)</span>
            </li>
            <li className="flex items-center">
              <div className="bg-white rounded-full p-1 mr-3">
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
              <span className="text-gray-700">Add AI-generated images to enhance your content</span>
            </li>
            <li className="flex items-center">
              <div className="bg-white rounded-full p-1 mr-3">
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
              <span className="text-gray-700">Full editing freedom before downloading</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}