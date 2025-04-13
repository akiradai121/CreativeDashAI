import { storage } from "../storage";
import { getOpenAICompletion, generateDallEImage } from "./openai";
import { generatePDF, generateEPUB, generateDOCX } from "./pdf";
import { Book, UserLimits } from "@shared/schema";
import { getPublicUrl, uploadFile, STORAGE_BUCKETS } from "../../client/src/lib/supabase";

// Number of pages to generate based on plan
const PAGE_LIMITS = {
  free: 10,
  creator: 25,
  pro: 50
};

// Generate content for a book based on prompt
export async function generateBookContent(book: Book, userLimits: UserLimits): Promise<void> {
  try {
    // Update book status to generating
    await storage.updateBook(book.id, { status: "generating" });
    
    // Determine number of pages to generate based on user's plan
    let pagesToGenerate = 10; // Default for free plan
    if (book.userId) {
      const user = await storage.getUser(book.userId);
      if (user) {
        switch (user.plan) {
          case "creator":
            pagesToGenerate = 25;
            break;
          case "pro":
            pagesToGenerate = 50;
            break;
        }
      }
    }
    
    // Limit by pages remaining
    pagesToGenerate = Math.min(pagesToGenerate, userLimits.pagesRemaining);
    
    if (pagesToGenerate <= 0) {
      await storage.updateBook(book.id, { 
        status: "completed",
        pages: 0
      });
      return;
    }
    
    // Generate book structure and content
    const bookStructure = await generateBookStructure(book.prompt, pagesToGenerate);
    
    // Create pages in the database
    let imageCreditsUsed = 0;
    for (let i = 0; i < bookStructure.pages.length; i++) {
      const pageData = bookStructure.pages[i];
      
      // Generate image if needed and if credits are available
      let imageUrl = null;
      if (book.includeImages && userLimits.imageCredits > imageCreditsUsed) {
        try {
          imageUrl = await generatePageImage(pageData.content);
          imageCreditsUsed++;
        } catch (error) {
          console.error("Error generating image:", error);
        }
      }
      
      // Create page
      await storage.createBookPage({
        bookId: book.id,
        pageNumber: i + 1,
        content: pageData.content,
        imageUrl
      });
    }
    
    // Update user limits
    await storage.updateUserLimits(book.userId, {
      pagesRemaining: userLimits.pagesRemaining - bookStructure.pages.length,
      imageCredits: userLimits.imageCredits - imageCreditsUsed
    });
    
    // Compile book files
    const urls = await compileBook(book);
    
    // Update book with URLs and status
    await storage.updateBook(book.id, {
      status: "completed",
      pages: bookStructure.pages.length,
      ...urls
    });
  } catch (error) {
    console.error("Error generating book content:", error);
    await storage.updateBook(book.id, { 
      status: "draft",
      pages: 0
    });
  }
}

// Generate book structure from prompt
async function generateBookStructure(prompt: string, numPages: number): Promise<{
  title: string;
  pages: { content: string }[];
}> {
  const structurePrompt = `
    You are a professional book writer. Create a structured book based on the following prompt:
    "${prompt}"
    
    The book should have exactly ${numPages} pages.
    
    Format your response as a JSON object with the following structure:
    {
      "title": "Book Title",
      "pages": [
        { "content": "Content of page 1 in HTML format" },
        { "content": "Content of page 2 in HTML format" },
        ...
      ]
    }
    
    Make sure each page content is in valid HTML format using p, h1, h2, etc. tags.
    Do not add any explanation, comments, or extra text outside the JSON structure.
  `;
  
  const completion = await getOpenAICompletion(structurePrompt);
  
  try {
    // Parse the response as JSON
    return JSON.parse(completion);
  } catch (error) {
    console.error("Error parsing book structure:", error);
    // Fallback to simple structure
    return {
      title: "Generated Book",
      pages: Array.from({ length: numPages }, (_, i) => ({
        content: `<h1>Page ${i + 1}</h1><p>Content generated from your prompt: "${prompt}"</p>`
      }))
    };
  }
}

// Generate an image for a page
export async function generatePageImage(content: string): Promise<string> {
  // Extract text content from HTML
  const textContent = content.replace(/<[^>]*>/g, ' ').trim();
  
  // Create a prompt for the image
  const imagePrompt = `Create an illustration for the following text: "${textContent.substring(0, 300)}"`;
  
  // Generate image
  const imageUrl = await generateDallEImage(imagePrompt);
  return imageUrl;
}

// Compile book into different formats
export async function compileBook(book: Book): Promise<{
  pdfUrl: string | null;
  epubUrl: string | null;
  docxUrl: string | null;
}> {
  // Get book pages
  const pages = await storage.getBookPages(book.id);
  
  if (pages.length === 0) {
    return {
      pdfUrl: null,
      epubUrl: null,
      docxUrl: null
    };
  }
  
  // Sort pages by page number
  pages.sort((a, b) => a.pageNumber - b.pageNumber);
  
  // Generate files
  try {
    // Generate PDF
    const pdfBuffer = await generatePDF(book.title, pages, book.pageSize);
    const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
    const pdfFile = new File([pdfBlob], `${book.id}_book.pdf`, { type: 'application/pdf' });
    await uploadFile(STORAGE_BUCKETS.PDF, `${book.id}/book.pdf`, pdfFile);
    const pdfUrl = getPublicUrl(STORAGE_BUCKETS.PDF, `${book.id}/book.pdf`);
    
    // Generate EPUB if format is EPUB
    let epubUrl = null;
    if (book.format === 'EPUB') {
      const epubBuffer = await generateEPUB(book.title, pages);
      const epubBlob = new Blob([epubBuffer], { type: 'application/epub+zip' });
      const epubFile = new File([epubBlob], `${book.id}_book.epub`, { type: 'application/epub+zip' });
      await uploadFile(STORAGE_BUCKETS.EPUB, `${book.id}/book.epub`, epubFile);
      epubUrl = getPublicUrl(STORAGE_BUCKETS.EPUB, `${book.id}/book.epub`);
    }
    
    // Generate DOCX if format is DOCX
    let docxUrl = null;
    if (book.format === 'DOCX') {
      const docxBuffer = await generateDOCX(book.title, pages);
      const docxBlob = new Blob([docxBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const docxFile = new File([docxBlob], `${book.id}_book.docx`, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      await uploadFile(STORAGE_BUCKETS.DOCX, `${book.id}/book.docx`, docxFile);
      docxUrl = getPublicUrl(STORAGE_BUCKETS.DOCX, `${book.id}/book.docx`);
    }
    
    return {
      pdfUrl,
      epubUrl,
      docxUrl
    };
  } catch (error) {
    console.error("Error compiling book:", error);
    return {
      pdfUrl: null,
      epubUrl: null,
      docxUrl: null
    };
  }
}
