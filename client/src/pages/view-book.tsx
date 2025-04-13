import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BookPreview from "@/components/book/book-preview";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileDown, Download, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ViewBook() {
  const params = useParams();
  const { toast } = useToast();
  const [downloadType, setDownloadType] = useState("pdf");
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

  // Handle download
  const handleDownload = (type: string) => {
    setDownloadType(type);
    
    let downloadUrl;
    switch (type) {
      case "pdf":
        downloadUrl = book?.pdfUrl;
        break;
      case "epub":
        downloadUrl = book?.epubUrl;
        break;
      case "docx":
        downloadUrl = book?.docxUrl;
        break;
      default:
        downloadUrl = book?.pdfUrl;
    }

    if (downloadUrl) {
      // Create temporary link and trigger download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${book.title}.${type}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      toast({
        title: "Download error",
        description: `The ${type.toUpperCase()} version is not available yet.`,
        variant: "destructive",
      });
    }
  };

  if (isLoadingBook) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
              <Skeleton className="h-8 w-64 mb-4" />
              <Skeleton className="h-4 w-40 mb-8" />
              <div className="mb-6 flex gap-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
              <Skeleton className="h-[600px] w-full rounded-lg" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (bookError || !book) {
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
                    {book.title}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    {book.status === "completed" 
                      ? "Your book is ready to download" 
                      : "Your book is still being generated"}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                  <Link href={`/edit-book/${bookId}`}>
                    <Button variant="outline">
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit This Book
                    </Button>
                  </Link>
                  
                  <Button 
                    onClick={() => handleDownload('pdf')}
                    disabled={!book.pdfUrl || book.status !== "completed"}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>

            {book.status === "generating" ? (
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <div className="inline-block mb-6">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      Your book is being generated
                    </h3>
                    <p className="text-gray-500">
                      This may take a few moments. Please wait...
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileDown className="mr-2 h-5 w-5" />
                      Book Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BookPreview bookId={bookId} />
                  </CardContent>
                </Card>

                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Download className="mr-2 h-5 w-5" />
                      Download Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className={`cursor-pointer border-2 ${downloadType === 'pdf' ? 'border-primary' : 'border-gray-200'}`}
                        onClick={() => setDownloadType('pdf')}>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <FileDown className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-medium">PDF Format</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Best for printing and reading on devices
                            </p>
                            <Button 
                              className="mt-4 w-full"
                              onClick={() => handleDownload('pdf')}
                              disabled={!book.pdfUrl}
                            >
                              Download PDF
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className={`cursor-pointer border-2 ${downloadType === 'epub' ? 'border-primary' : 'border-gray-200'}`}
                        onClick={() => setDownloadType('epub')}>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="h-12 w-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <FileDown className="h-6 w-6 text-secondary-600" />
                            </div>
                            <h3 className="font-medium">EPUB Format</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Best for e-readers and mobile devices
                            </p>
                            <Button 
                              className="mt-4 w-full"
                              onClick={() => handleDownload('epub')}
                              disabled={!book.epubUrl}
                              variant="outline"
                            >
                              Download EPUB
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className={`cursor-pointer border-2 ${downloadType === 'docx' ? 'border-primary' : 'border-gray-200'}`}
                        onClick={() => setDownloadType('docx')}>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <FileDown className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="font-medium">DOCX Format</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Best for editing in Microsoft Word
                            </p>
                            <Button 
                              className="mt-4 w-full"
                              onClick={() => handleDownload('docx')}
                              disabled={!book.docxUrl}
                              variant="outline"
                            >
                              Download DOCX
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
