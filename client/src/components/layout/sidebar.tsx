import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  LayoutDashboard,
  BookPlus,
  Settings,
  CreditCard,
  HelpCircle,
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Query for user limits
  const { data: limits, isLoading: isLoadingLimits } = useQuery({
    queryKey: ['/api/user/limits'],
    enabled: !!user
  });

  // Query for recent books
  const { data: recentBooks = [], isLoading: isLoadingBooks } = useQuery({
    queryKey: ['/api/books/recent'],
    enabled: !!user
  });

  const routes = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      path: "/create-book",
      label: "Create Book",
      icon: BookPlus,
    },
    {
      path: "/pricing",
      label: "Pricing",
      icon: CreditCard,
    },
  ];

  return (
    <div className="w-64 hidden md:flex flex-col bg-white border-r border-gray-200 h-screen sticky top-16">
      <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
        <nav className="mt-2 flex-1 px-4 space-y-1">
          {routes.map((route) => (
            <Link key={route.path} href={route.path}>
              <a
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  location === route.path
                    ? "bg-primary-50 text-primary"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <route.icon
                  className={cn(
                    "mr-3 h-5 w-5",
                    location === route.path ? "text-primary" : "text-gray-400"
                  )}
                />
                <span>{route.label}</span>
              </a>
            </Link>
          ))}

          {recentBooks.length > 0 && (
            <div className="mt-6 space-y-2">
              <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Recent Books
              </div>
              {isLoadingBooks ? (
                <>
                  <Skeleton className="h-9 w-full rounded-lg" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                </>
              ) : (
                recentBooks.slice(0, 3).map((book: any) => (
                  <Link key={book.id} href={`/view-book/${book.id}`}>
                    <a className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50">
                      <BookOpen className="mr-3 h-5 w-5 text-gray-400" />
                      <span className="truncate">{book.title}</span>
                    </a>
                  </Link>
                ))
              )}
            </div>
          )}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="bg-primary-100 p-1 rounded">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-800">
                {user?.plan ? (
                  user.plan.charAt(0).toUpperCase() + user.plan.slice(1)
                ) : (
                  "Free"
                )} Plan
              </span>
            </div>
            <span className="text-xs bg-primary-100 text-primary py-0.5 px-2 rounded-full font-medium">
              Active
            </span>
          </div>

          <div className="space-y-2">
            {isLoadingLimits ? (
              <>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
              </>
            ) : limits ? (
              <>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Books</span>
                    <span className="font-medium">
                      {limits.booksRemaining} of {limits.booksTotal}
                    </span>
                  </div>
                  <Progress 
                    value={((limits.booksTotal - limits.booksRemaining) / limits.booksTotal) * 100} 
                    className="h-1.5" 
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Pages</span>
                    <span className="font-medium">
                      {limits.pagesRemaining} of {limits.pagesTotal}
                    </span>
                  </div>
                  <Progress 
                    value={((limits.pagesTotal - limits.pagesRemaining) / limits.pagesTotal) * 100} 
                    className="h-1.5" 
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Image Credits</span>
                    <span className="font-medium">
                      {limits.imageCredits} of {limits.imageCreditsTotal}
                    </span>
                  </div>
                  <Progress 
                    value={((limits.imageCreditsTotal - limits.imageCredits) / limits.imageCreditsTotal) * 100} 
                    className="h-1.5" 
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-2">
                <span className="text-sm text-gray-500">No usage data available</span>
              </div>
            )}
          </div>
          
          <Link href="/pricing">
            <Button variant="link" size="sm" className="mt-2 w-full">
              {user?.plan === "free" ? "Upgrade Plan" : "Manage Subscription"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
