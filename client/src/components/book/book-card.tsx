import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, Pencil, Download, Trash2, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface BookCardProps {
  book: {
    id: number;
    title: string;
    status: string;
    format: string;
    pageSize: string;
    pages: number;
    createdAt: string;
    updatedAt: string;
  };
  onDelete: () => void;
}

export default function BookCard({ book, onDelete }: BookCardProps) {
  const createdAt = new Date(book.createdAt);
  const updatedAt = new Date(book.updatedAt);
  
  // Format relative time
  const timeAgo = formatDistanceToNow(updatedAt, { addSuffix: true });
  
  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "generating":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="h-40 bg-gray-100 flex items-center justify-center">
        {book.status === "completed" ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-primary-50 to-primary-100">
            <BookOpen className="h-12 w-12 text-primary-200" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100">
            <BookOpen className="h-12 w-12 text-gray-300" />
          </div>
        )}
      </div>
      
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <Badge className={getStatusColor(book.status)}>
            {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
          </Badge>
          <span className="text-xs text-gray-500">{timeAgo}</span>
        </div>
        <h3 className="font-medium text-gray-900 truncate mb-1">{book.title}</h3>
        <div className="text-sm text-gray-500 flex flex-wrap gap-2">
          <span>{book.format}</span>
          <span>•</span>
          <span>{book.pageSize}</span>
          <span>•</span>
          <span>{book.pages} pages</span>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-0">
        <Link href={`/view-book/${book.id}`}>
          <Button variant="outline" size="sm">
            <BookOpen className="h-4 w-4 mr-1" />
            View
          </Button>
        </Link>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/view-book/${book.id}`}>
                <a className="flex items-center cursor-pointer">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Book
                </a>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/edit-book/${book.id}`}>
                <a className="flex items-center cursor-pointer">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Book
                </a>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/view-book/${book.id}`}>
                <a className="flex items-center cursor-pointer">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-700"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Book
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
