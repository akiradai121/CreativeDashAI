import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
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
import { BookText, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Header for mobile view only */}
      <div className="md:hidden p-6 flex items-center justify-between border-b">
        <Link href="/">
          <div className="flex items-center">
            <BookText className="h-6 w-6 text-purple-600" />
            <span className="ml-2 text-xl font-bold text-gray-900 font-poppins">
              Prompt<span className="text-purple-600">2Book</span>
            </span>
          </div>
        </Link>
      </div>

      {/* Left side - Forms */}
      <div className="w-full md:w-1/2 p-6 md:p-16 flex flex-col justify-center">
        <div className="hidden md:flex mb-10 items-center">
          <Link href="/">
            <div className="flex items-center">
              <BookText className="h-7 w-7 text-purple-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900 font-poppins">
                Prompt<span className="text-purple-600">2Book</span>
              </span>
            </div>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md mx-auto w-full"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 font-poppins">
              {activeTab === "login" ? "Welcome back" : "Create an account"}
            </h1>
            <p className="text-gray-500">
              {activeTab === "login" 
                ? "Sign in to your Prompt2Book account to continue" 
                : "Join Prompt2Book to start creating amazing books"}
            </p>
          </div>

          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-8 w-full">
              <TabsTrigger value="login" className="text-base">Sign In</TabsTrigger>
              <TabsTrigger value="register" className="text-base">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your username" 
                            className="h-12 rounded-lg" 
                            {...field} 
                          />
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
                        <FormLabel className="text-gray-700">Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Enter your password" 
                            className="h-12 rounded-lg" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base rounded-lg bg-purple-600 hover:bg-purple-700"
                  >
                    Sign In
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Don't have an account?{" "}
                  <button 
                    onClick={() => setActiveTab("register")} 
                    className="text-purple-600 font-medium hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </TabsContent>

            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Choose a username" 
                            className="h-12 rounded-lg" 
                            {...field} 
                          />
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
                        <FormLabel className="text-gray-700">Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="Enter your email" 
                            className="h-12 rounded-lg" 
                            {...field} 
                          />
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
                        <FormLabel className="text-gray-700">Full Name (optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your full name" 
                            className="h-12 rounded-lg" 
                            {...field} 
                          />
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
                        <FormLabel className="text-gray-700">Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Create a password" 
                            className="h-12 rounded-lg" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base rounded-lg bg-purple-600 hover:bg-purple-700"
                  >
                    Sign Up
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Already have an account?{" "}
                  <button 
                    onClick={() => setActiveTab("login")} 
                    className="text-purple-600 font-medium hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-purple-50 via-blue-50 to-purple-100 p-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-lg mx-auto"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 font-poppins">
            Turn a Prompt into a <span className="text-purple-600">Full Book</span> Instantly
          </h2>
          
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="h-40 bg-purple-200 rounded-lg mb-4 flex items-center justify-center">
              <BookText className="h-16 w-16 text-purple-600" />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-100 rounded w-3/4"></div>
              <div className="h-3 bg-gray-100 rounded w-full"></div>
              <div className="h-3 bg-gray-100 rounded w-5/6"></div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-purple-600 mt-1 mr-3 flex-shrink-0" />
              <p className="text-gray-700">Generate complete books from simple text prompts with AI technology</p>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-purple-600 mt-1 mr-3 flex-shrink-0" />
              <p className="text-gray-700">Download in multiple formats including PDF, EPUB, and DOCX</p>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-purple-600 mt-1 mr-3 flex-shrink-0" />
              <p className="text-gray-700">Enhance your books with AI-generated images that match your content</p>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-purple-600 mt-1 mr-3 flex-shrink-0" />
              <p className="text-gray-700">Edit and customize every aspect before finalizing your book</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}