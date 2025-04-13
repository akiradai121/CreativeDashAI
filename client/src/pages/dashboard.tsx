import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookPlus, BookOpen, Plus, Settings } from "lucide-react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import BookCard from "@/components/book/book-card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("all");

  // Redirect to landing page if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch user's books
  const { 
    data: books = [], 
    isLoading: isLoadingBooks,
    error: booksError
  } = useQuery({
    queryKey: ['/api/books'],
    enabled: !!user
  });

  // Fetch user's usage limits
  const {
    data: limits,
    isLoading: isLoadingLimits
  } = useQuery({
    queryKey: ['/api/user/limits'],
    enabled: !!user
  });

  // Delete book mutation
  const deleteBookMutation = useMutation({
    mutationFn: async (bookId: number) => {
      return apiRequest('DELETE', `/api/books/${bookId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      toast({
        title: "Book deleted",
        description: "Your book has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete book: ${error}`,
        variant: "destructive",
      });
    }
  });

  const handleDeleteBook = (bookId: number) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      deleteBookMutation.mutate(bookId);
    }
  };

  if (!user) {
    return null; // Will redirect via useEffect
  }

  // Filter books based on current tab
  const filteredBooks = books.filter(book => {
    if (currentTab === "all") return true;
    if (currentTab === "draft" && book.status === "draft") return true;
    if (currentTab === "completed" && book.status === "completed") return true;
    return false;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Welcome header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="text-2xl font-poppins font-semibold text-gray-900">
                  Welcome back, {user?.fullName || user?.username}!
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Create, edit and manage your books
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <Link href="/create-book">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create New Book
                  </Button>
                </Link>
              </div>
            </div>

            {/* Usage stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 rounded-md bg-primary-100 p-3">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      {isLoadingLimits ? (
                        <Skeleton className="h-8 w-24" />
                      ) : (
                        <>
                          <dt className="text-sm font-medium text-gray-500 truncate">Books Remaining</dt>
                          <dd className="text-lg font-semibold text-gray-900">
                            {limits?.booksRemaining || 0}
                          </dd>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 rounded-md bg-secondary-100 p-3">
                      <BookPlus className="h-6 w-6 text-secondary-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      {isLoadingLimits ? (
                        <Skeleton className="h-8 w-24" />
                      ) : (
                        <>
                          <dt className="text-sm font-medium text-gray-500 truncate">Pages Remaining</dt>
                          <dd className="text-lg font-semibold text-gray-900">
                            {limits?.pagesRemaining || 0}
                          </dd>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 rounded-md bg-green-100 p-3">
                      <Settings className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      {isLoadingLimits ? (
                        <Skeleton className="h-8 w-24" />
                      ) : (
                        <>
                          <dt className="text-sm font-medium text-gray-500 truncate">Image Credits</dt>
                          <dd className="text-lg font-semibold text-gray-900">
                            {limits?.imageCredits || 0}
                          </dd>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Books section */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-200">
                <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Your Books</h2>
                    <TabsList>
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="draft">Drafts</TabsTrigger>
                      <TabsTrigger value="completed">Completed</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="all" className="mt-4">
                    {isLoadingBooks ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex flex-col space-y-3">
                            <Skeleton className="h-[250px] w-full rounded-lg" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        ))}
                      </div>
                    ) : booksError ? (
                      <div className="text-center py-10">
                        <p className="text-red-500">Error loading books. Please try again.</p>
                      </div>
                    ) : filteredBooks.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-gray-500">You don't have any books yet.</p>
                        <Link href="/create-book">
                          <Button className="mt-4">
                            <Plus className="mr-2 h-4 w-4" /> Create Your First Book
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBooks.map((book) => (
                          <BookCard 
                            key={book.id} 
                            book={book} 
                            onDelete={() => handleDeleteBook(book.id)} 
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="draft" className="mt-4">
                    {isLoadingBooks ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2].map((i) => (
                          <div key={i} className="flex flex-col space-y-3">
                            <Skeleton className="h-[250px] w-full rounded-lg" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        ))}
                      </div>
                    ) : filteredBooks.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-gray-500">You don't have any draft books.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBooks.map((book) => (
                          <BookCard 
                            key={book.id} 
                            book={book} 
                            onDelete={() => handleDeleteBook(book.id)} 
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="completed" className="mt-4">
                    {isLoadingBooks ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2].map((i) => (
                          <div key={i} className="flex flex-col space-y-3">
                            <Skeleton className="h-[250px] w-full rounded-lg" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        ))}
                      </div>
                    ) : filteredBooks.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-gray-500">You don't have any completed books.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBooks.map((book) => (
                          <BookCard 
                            key={book.id} 
                            book={book} 
                            onDelete={() => handleDeleteBook(book.id)} 
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Upgrade plan card */}
            {(user?.plan === "free" || !user?.plan) && (
              <Card className="mb-8 bg-gray-50 border border-primary-100">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-lg font-medium text-gray-900">Upgrade to Creator</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Get more books, pages, and image credits with our Creator plan.
                      </p>
                    </div>
                    <Link href="/pricing">
                      <Button>View Plans</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
