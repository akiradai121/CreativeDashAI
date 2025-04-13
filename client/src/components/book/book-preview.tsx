import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BookPreviewProps {
  bookId: number;
}

export default function BookPreview({ bookId }: BookPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch book pages
  const {
    data: bookPages = [],
    isLoading: isLoadingPages,
    error: pagesError
  } = useQuery({
    queryKey: [`/api/books/${bookId}/pages`],
    enabled: !!bookId && !isNaN(bookId)
  });

  // Reset to page 1 when book changes
  useEffect(() => {
    setCurrentPage(1);
  }, [bookId]);

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

  // Current page content
  const currentPageData = bookPages.find(page => page.pageNumber === currentPage);

  if (isLoadingPages) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[500px] w-full rounded-lg" />
        <div className="flex justify-between">
          <Skeleton className="h-10 w-28" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    );
  }

  if (pagesError || bookPages.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">
          {pagesError ? "Error loading book pages" : "No pages found for this book"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 aspect-[3/4] flex flex-col overflow-auto relative">
        {/* Page content */}
        <div className="flex-1 overflow-auto prose max-w-none">
          {currentPageData?.content ? (
            <div dangerouslySetInnerHTML={{ __html: currentPageData.content }} />
          ) : (
            <div className="text-center text-gray-500 h-full flex items-center justify-center">
              <p>This page has no content.</p>
            </div>
          )}
        </div>
        
        {/* Page image */}
        {currentPageData?.imageUrl && (
          <div className="mt-4">
            <img 
              src={currentPageData.imageUrl} 
              alt="Page illustration" 
              className="w-full h-auto rounded-md"
            />
          </div>
        )}
        
        {/* Page number */}
        <div className="absolute bottom-2 right-4 text-sm text-gray-400">
          Page {currentPage}
        </div>
      </div>
      
      {/* Page navigation */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        
        <div className="flex items-center space-x-2">
          {bookPages.length <= 7 ? (
            bookPages.map((page) => (
              <Button
                key={page.id}
                variant={currentPage === page.pageNumber ? "default" : "outline"}
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => setCurrentPage(page.pageNumber)}
              >
                {page.pageNumber}
              </Button>
            ))
          ) : (
            <>
              {/* First page */}
              <Button
                variant={currentPage === 1 ? "default" : "outline"}
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => setCurrentPage(1)}
              >
                1
              </Button>
              
              {/* Show ellipsis if not near the start */}
              {currentPage > 3 && (
                <span className="text-gray-500">...</span>
              )}
              
              {/* Pages around current page */}
              {bookPages
                .filter(page => 
                  page.pageNumber !== 1 && 
                  page.pageNumber !== bookPages.length &&
                  Math.abs(page.pageNumber - currentPage) <= 1
                )
                .map(page => (
                  <Button
                    key={page.id}
                    variant={currentPage === page.pageNumber ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentPage(page.pageNumber)}
                  >
                    {page.pageNumber}
                  </Button>
                ))
              }
              
              {/* Show ellipsis if not near the end */}
              {currentPage < bookPages.length - 2 && (
                <span className="text-gray-500">...</span>
              )}
              
              {/* Last page */}
              <Button
                variant={currentPage === bookPages.length ? "default" : "outline"}
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => setCurrentPage(bookPages.length)}
              >
                {bookPages.length}
              </Button>
            </>
          )}
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleNextPage}
          disabled={currentPage === bookPages.length}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
