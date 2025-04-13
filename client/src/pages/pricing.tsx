import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/header";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Check, ArrowLeft, Loader2 } from "lucide-react";

export default function Pricing() {
  const { user, isLoading: isLoadingUser } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Create checkout session mutation
  const checkoutMutation = useMutation({
    mutationFn: async (planId: string) => {
      return apiRequest('POST', '/api/create-checkout-session', { planId });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Checkout Error",
          description: "Could not create checkout session",
          variant: "destructive",
        });
        setIsCheckingOut(false);
      }
    },
    onError: (error) => {
      toast({
        title: "Checkout Error",
        description: String(error),
        variant: "destructive",
      });
      setIsCheckingOut(false);
    }
  });

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleCheckout = () => {
    if (!selectedPlan) return;
    
    if (!user) {
      // Redirect to sign up/login if not logged in
      navigate("/login");
      return;
    }
    
    setIsCheckingOut(true);
    checkoutMutation.mutate(selectedPlan);
  };

  const plans = [
    {
      id: "free",
      name: "Free",
      description: "Try out Prompt2Book with basic features.",
      price: "$0",
      interval: "month",
      features: [
        "1 book",
        "10 pages per book",
        "Basic editing",
        "PDF export only"
      ],
      buttonText: user ? "Current Plan" : "Get Started",
      isPopular: false,
      disabled: user?.plan === "free"
    },
    {
      id: "creator",
      name: "Creator",
      description: "Perfect for authors and content creators.",
      price: "$9.99",
      interval: "month",
      features: [
        "5 books",
        "200 pages total",
        "10 image credits",
        "Advanced editing",
        "PDF, EPUB & DOCX export",
        "Priority support"
      ],
      buttonText: user?.plan === "creator" ? "Current Plan" : "Upgrade",
      isPopular: true,
      disabled: user?.plan === "creator"
    },
    {
      id: "pro",
      name: "Pro",
      description: "For serious authors and publishers.",
      price: "$19.99",
      interval: "month",
      features: [
        "Unlimited books",
        "1,000 pages total",
        "50 image credits",
        "Premium editing",
        "All export formats",
        "Priority support",
        "Custom formatting options"
      ],
      buttonText: user?.plan === "pro" ? "Current Plan" : "Upgrade",
      isPopular: false,
      disabled: user?.plan === "pro"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link href={user ? "/dashboard" : "/"}>
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> 
                {user ? "Back to Dashboard" : "Back to Home"}
              </Button>
            </Link>
            
            <div className="text-center">
              <h1 className="text-3xl font-poppins font-bold text-gray-900 sm:text-4xl">
                Simple, transparent pricing
              </h1>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Choose the plan that's right for you. All plans include access to our AI-powered book generation technology.
              </p>
            </div>
          </div>

          <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:grid-cols-3">
            {plans.map((plan) => (
              <Card 
                key={plan.id}
                className={`flex flex-col ${plan.isPopular ? 'border-primary ring-2 ring-primary' : ''}`}
              >
                <CardHeader>
                  {plan.isPopular && (
                    <div className="absolute top-0 right-0 mr-6 -mt-4 rounded-full bg-primary py-1 px-4">
                      <p className="text-xs font-medium text-white">Most popular</p>
                    </div>
                  )}
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mt-2">
                    <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                    <span className="text-base font-medium text-gray-500">/{plan.interval}</span>
                  </div>
                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex">
                        <Check className="h-5 w-5 flex-shrink-0 text-primary" />
                        <span className="ml-3 text-base text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={plan.id === "free" ? "outline" : "default"}
                    className="w-full"
                    disabled={plan.disabled || isCheckingOut}
                    onClick={() => {
                      if (plan.id === "free") {
                        navigate("/dashboard");
                      } else {
                        handleSelectPlan(plan.id);
                        handleCheckout();
                      }
                    }}
                  >
                    {isCheckingOut && selectedPlan === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      plan.buttonText
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-16 bg-white p-8 shadow-sm rounded-lg max-w-3xl mx-auto">
            <h2 className="text-lg font-medium text-gray-900">Frequently asked questions</h2>
            <div className="mt-6 space-y-6 divide-y divide-gray-200">
              <div className="pt-6">
                <dt className="text-base font-medium text-gray-900">
                  What happens when I reach my limits?
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Once you reach your plan's limits, you'll need to upgrade to a higher plan or wait until the next billing cycle when your limits reset.
                </dd>
              </div>
              <div className="pt-6">
                <dt className="text-base font-medium text-gray-900">
                  Can I cancel my subscription?
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period.
                </dd>
              </div>
              <div className="pt-6">
                <dt className="text-base font-medium text-gray-900">
                  How are image credits counted?
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Each image generation counts as one credit, whether it's during initial book generation or when you regenerate an image later.
                </dd>
              </div>
              <div className="pt-6">
                <dt className="text-base font-medium text-gray-900">
                  Do unused credits roll over?
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  No, unused credits or pages don't roll over to the next billing cycle. Your limits reset at the beginning of each billing period.
                </dd>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white py-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">
              &copy; 2023 Prompt2Book. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
