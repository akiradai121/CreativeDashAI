import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import BookEditor from "@/components/book/book-editor";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, RefreshCw, FileDown, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function EditBook() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const bookId = parseInt(params.id as string);

  // Fetch book details
  const {
    data: book,
    isLoading: isLoadingBook,
    error: bookError
  } = useQuery({
    queryKey: [`/api/books/${bookId}`],
    enabled: !!bookId && !isNaN(bookId)
  });

  // Fetch book pages
  const {
    data: bookPages = [],
    isLoading: isLoadingPages,
    error: pagesError
  } = useQuery({
    queryKey: [`/api/books/${bookId}/pages`],
    enabled: !!bookId && !isNaN(bookId)
  });

  // Update book page mutation
  const updatePageMutation = useMutation({
    mutationFn: async ({ pageId, content }: { pageId: number, content: string }) => {
      return apiRequest('PATCH', `/api/books/pages/${pageId}`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/books/${bookId}/pages`] });
      toast({
        title: "Page updated",
        description: "Your changes have been saved.",
      });
      setIsSaving(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update page: ${error}`,
        variant: "destructive",
      });
      setIsSaving(false);
    }
  });

  // Regenerate page image mutation
  const regenerateImageMutation = useMutation({
    mutationFn: async (pageId: number) => {
      return apiRequest('POST', `/api/books/pages/${pageId}/regenerate-image`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/books/${bookId}/pages`] });
      toast({
        title: "Image regenerated",
        description: "New image has been generated for this page.",
      });
      setIsRegenerating(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to regenerate image: ${error}`,
        variant: "destructive",
      });
      setIsRegenerating(false);
    }
  });

  // Recompile book mutation
  const recompileBookMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/books/${bookId}/recompile`);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/books/${bookId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/books/${bookId}/pages`] });
      toast({
        title: "Book recompiled",
        description: "Your book has been recompiled with the latest changes.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to recompile book: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Handle page content update
  const handleSavePage = (content: string) => {
    const currentPageData = bookPages.find(page => page.pageNumber === currentPage);
    if (currentPageData) {
      setIsSaving(true);
      updatePageMutation.mutate({ pageId: currentPageData.id, content });
    }
  };

  // Handle regenerate image
  const handleRegenerateImage = () => {
    const currentPageData = bookPages.find(page => page.pageNumber === currentPage);
    if (currentPageData) {
      setIsRegenerating(true);
      regenerateImageMutation.mutate(currentPageData.id);
    }
  };

  // Handle recompile book
  const handleRecompileBook = () => {
    recompileBookMutation.mutate();
  };

  // Current page content
  const currentPageData = bookPages.find(page => page.pageNumber === currentPage);

  // Navigate to previous page
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Navigate to next page
  const handleNextPage = () => {
    if (currentPage < bookPages.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (isLoadingBook || isLoadingPages) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
              <Skeleton className="h-8 w-64 mb-4" />
              <Skeleton className="h-4 w-40 mb-8" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-[500px] w-full rounded-lg" />
                <Skeleton className="h-[500px] w-full rounded-lg" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (bookError || pagesError || !book) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center py-10">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Error loading book
                </h2>
                <p className="text-gray-500 mb-6">
                  There was a problem loading this book. Please try again.
                </p>
                <Link href="/dashboard">
                  <Button>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
              </Link>
              
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-poppins font-semibold text-gray-900">
                    Editing: {book.title}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Edit your book content and layout
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleRecompileBook}
                    disabled={recompileBookMutation.isPending}
                  >
                    {recompileBookMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Recompile Book
                  </Button>
                  
                  <Link href={`/view-book/${bookId}`}>
                    <Button>
                      <FileDown className="mr-2 h-4 w-4" />
                      View & Download
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Page Editor</span>
                  <div className="flex items-center text-sm text-gray-500">
                    Page {currentPage} of {bookPages.length}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Page preview */}
                  <div className="bg-white border rounded-lg shadow-sm p-6 aspect-[3/4] flex flex-col">
                    <div className="flex-1 overflow-auto prose max-w-none">
                      {currentPageData?.content ? (
                        <div dangerouslySetInnerHTML={{ __html: currentPageData.content }} />
                      ) : (
                        <div className="text-center text-gray-500 h-full flex items-center justify-center">
                          <p>This page has no content.</p>
                        </div>
                      )}
                    </div>
                    {currentPageData?.imageUrl && (
                      <div className="mt-4">
                        <img 
                          src={currentPageData.imageUrl} 
                          alt="Page illustration" 
                          className="w-full h-auto rounded-md"
                        />
                      </div>
                    )}
                  </div>

                  {/* Editor */}
                  <div>
                    <Tabs defaultValue="edit" className="w-full">
                      <TabsList className="mb-4 w-full">
                        <TabsTrigger value="edit" className="flex-1">Edit Content</TabsTrigger>
                        <TabsTrigger value="format" className="flex-1">Format</TabsTrigger>
                        <TabsTrigger value="image" className="flex-1">Image</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="edit">
                        <BookEditor 
                          content={currentPageData?.content || ''} 
                          onSave={handleSavePage}
                          isSaving={isSaving}
                        />
                      </TabsContent>
                      
                      <TabsContent value="format">
                        <div className="p-4 border rounded-md">
                          <h3 className="text-sm font-medium mb-3">Formatting Options</h3>
                          <p className="text-sm text-gray-500 mb-4">
                            These options affect the current page layout.
                          </p>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">
                                Font Size
                              </label>
                              <div className="flex gap-2 mt-2">
                                <Button variant="outline" size="sm">Small</Button>
                                <Button variant="outline" size="sm">Medium</Button>
                                <Button variant="outline" size="sm">Large</Button>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                Alignment
                              </label>
                              <div className="flex gap-2 mt-2">
                                <Button variant="outline" size="sm">Left</Button>
                                <Button variant="outline" size="sm">Center</Button>
                                <Button variant="outline" size="sm">Right</Button>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                Margins
                              </label>
                              <div className="flex gap-2 mt-2">
                                <Button variant="outline" size="sm">Small</Button>
                                <Button variant="outline" size="sm">Medium</Button>
                                <Button variant="outline" size="sm">Large</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="image">
                        <div className="p-4 border rounded-md">
                          <h3 className="text-sm font-medium mb-3">Image Options</h3>
                          
                          {!book.includeImages ? (
                            <div className="text-center p-6 bg-gray-50 rounded-md">
                              <p className="text-sm text-gray-500 mb-4">
                                This book doesn't have image generation enabled.
                              </p>
                              <Button variant="outline" disabled>
                                Enable Images
                              </Button>
                            </div>
                          ) : currentPageData?.imageUrl ? (
                            <div className="space-y-4">
                              <div>
                                <img 
                                  src={currentPageData.imageUrl} 
                                  alt="Page illustration" 
                                  className="w-full h-auto rounded-md"
                                />
                              </div>
                              <Button 
                                variant="outline" 
                                className="w-full" 
                                onClick={handleRegenerateImage}
                                disabled={isRegenerating}
                              >
                                {isRegenerating ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                )}
                                Regenerate Image
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center p-6 bg-gray-50 rounded-md">
                              <p className="text-sm text-gray-500 mb-4">
                                This page doesn't have an image.
                              </p>
                              <Button 
                                onClick={handleRegenerateImage}
                                disabled={isRegenerating}
                              >
                                {isRegenerating ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  "Generate Image"
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>

                {/* Page navigation */}
                <div className="flex items-center justify-between mt-6">
                  <Button 
                    variant="outline" 
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    Previous Page
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    {bookPages.slice(0, 7).map((page, index) => (
                      <Button
                        key={page.id}
                        variant={currentPage === page.pageNumber ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setCurrentPage(page.pageNumber)}
                      >
                        {page.pageNumber}
                      </Button>
                    ))}
                    {bookPages.length > 7 && (
                      <span className="text-gray-500">...</span>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleNextPage}
                    disabled={currentPage === bookPages.length}
                  >
                    Next Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
