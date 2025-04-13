import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface FormatSelectorProps {
  format: string;
  pageSize: string;
  onFormatChange: (format: string) => void;
  onPageSizeChange: (pageSize: string) => void;
  onFontSizeChange?: (fontSize: number) => void;
  onMarginChange?: (margin: number) => void;
}

export default function FormatSelector({
  format,
  pageSize,
  onFormatChange,
  onPageSizeChange,
  onFontSizeChange,
  onMarginChange,
}: FormatSelectorProps) {
  const [fontSize, setFontSize] = useState(12);
  const [margin, setMargin] = useState(20);

  const handleFontSizeChange = (values: number[]) => {
    const newFontSize = values[0];
    setFontSize(newFontSize);
    if (onFontSizeChange) {
      onFontSizeChange(newFontSize);
    }
  };

  const handleMarginChange = (values: number[]) => {
    const newMargin = values[0];
    setMargin(newMargin);
    if (onMarginChange) {
      onMarginChange(newMargin);
    }
  };

  return (
    <Tabs defaultValue="format" className="w-full">
      <TabsList className="mb-4 w-full">
        <TabsTrigger value="format" className="flex-1">Format</TabsTrigger>
        <TabsTrigger value="layout" className="flex-1">Layout</TabsTrigger>
        <TabsTrigger value="typography" className="flex-1">Typography</TabsTrigger>
      </TabsList>
      
      <TabsContent value="format">
        <div className="space-y-4 p-4 border rounded-md">
          <div>
            <Label htmlFor="book-format">File Format</Label>
            <Select
              value={format}
              onValueChange={onFormatChange}
            >
              <SelectTrigger id="book-format" className="mt-1">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="EPUB">EPUB</SelectItem>
                <SelectItem value="DOCX">DOCX</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Choose the file format for your final book
            </p>
          </div>
          
          <div>
            <Label htmlFor="page-size">Page Size</Label>
            <Select
              value={pageSize}
              onValueChange={onPageSizeChange}
            >
              <SelectTrigger id="page-size" className="mt-1">
                <SelectValue placeholder="Select page size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4 (210mm × 297mm)</SelectItem>
                <SelectItem value="A5">A5 (148mm × 210mm)</SelectItem>
                <SelectItem value="Letter">US Letter (8.5" × 11")</SelectItem>
                <SelectItem value="Custom">Custom Size</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Choose the size of your book pages
            </p>
          </div>
          
          {pageSize === "Custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="custom-width">Width (mm)</Label>
                <input
                  id="custom-width"
                  type="number"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                  defaultValue={210}
                />
              </div>
              <div>
                <Label htmlFor="custom-height">Height (mm)</Label>
                <input
                  id="custom-height"
                  type="number"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                  defaultValue={297}
                />
              </div>
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="layout">
        <div className="space-y-4 p-4 border rounded-md">
          <div>
            <Label htmlFor="margin-slider">Margins</Label>
            <div className="pt-4 pb-2">
              <Slider
                id="margin-slider" 
                value={[margin]} 
                min={10} 
                max={40} 
                step={1}
                onValueChange={handleMarginChange}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Narrow</span>
              <span>{margin}mm</span>
              <span>Wide</span>
            </div>
          </div>
          
          <div className="mt-6">
            <Label>Page Layout</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Button variant="outline" className="h-20 flex flex-col">
                <span className="text-xs">Single Column</span>
                <div className="mt-2 h-10 w-8 bg-gray-200 rounded"></div>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <span className="text-xs">Two Columns</span>
                <div className="mt-2 flex space-x-1">
                  <div className="h-10 w-4 bg-gray-200 rounded"></div>
                  <div className="h-10 w-4 bg-gray-200 rounded"></div>
                </div>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <span className="text-xs">Three Columns</span>
                <div className="mt-2 flex space-x-1">
                  <div className="h-10 w-2.5 bg-gray-200 rounded"></div>
                  <div className="h-10 w-2.5 bg-gray-200 rounded"></div>
                  <div className="h-10 w-2.5 bg-gray-200 rounded"></div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="typography">
        <div className="space-y-4 p-4 border rounded-md">
          <div>
            <Label htmlFor="font-size-slider">Font Size</Label>
            <div className="pt-4 pb-2">
              <Slider
                id="font-size-slider" 
                value={[fontSize]} 
                min={8} 
                max={18} 
                step={1}
                onValueChange={handleFontSizeChange}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Small</span>
              <span>{fontSize}pt</span>
              <span>Large</span>
            </div>
          </div>
          
          <div className="mt-6">
            <Label>Font Family</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button variant="outline" className="h-14 flex flex-col">
                <span className="font-serif">Serif</span>
                <span className="text-xs text-gray-500 mt-1">Traditional</span>
              </Button>
              <Button variant="outline" className="h-14 flex flex-col">
                <span className="font-sans">Sans-serif</span>
                <span className="text-xs text-gray-500 mt-1">Modern</span>
              </Button>
            </div>
          </div>
          
          <div className="mt-6">
            <Label>Text Alignment</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Button variant="outline" size="sm">Left</Button>
              <Button variant="outline" size="sm">Center</Button>
              <Button variant="outline" size="sm">Justify</Button>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
