import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { BookPage } from '@shared/schema';
import * as epub from 'epub-gen';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as util from 'util';

const writeFileAsync = util.promisify(fs.writeFile);
const readFileAsync = util.promisify(fs.readFile);
const unlinkAsync = util.promisify(fs.unlink);

// Get page dimensions in points
function getPageDimensions(pageSize: string): { width: number; height: number } {
  switch (pageSize) {
    case 'A4':
      return { width: 595.28, height: 841.89 };
    case 'A5':
      return { width: 419.53, height: 595.28 };
    case 'Letter':
      return { width: 612, height: 792 };
    case 'Custom':
      return { width: 612, height: 792 }; // Default to Letter size for custom
    default:
      return { width: 595.28, height: 841.89 }; // Default to A4
  }
}

// Parse HTML content to plain text
function htmlToPlainText(html: string): string {
  return html
    .replace(/<\/?[^>]+(>|$)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract headings from HTML
function extractHeadings(html: string): { level: number; text: string }[] {
  const headings: { level: number; text: string }[] = [];
  const headingRegex = /<h([1-6])>(.*?)<\/h\1>/gi;
  let match;
  
  while ((match = headingRegex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      text: match[2].replace(/<\/?[^>]+(>|$)/g, '')
    });
  }
  
  return headings;
}

// Generate PDF from book content
export async function generatePDF(
  title: string,
  pages: BookPage[],
  pageSize: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const dimensions = getPageDimensions(pageSize);
  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontSize = 12;
  const margin = 50;
  const lineHeight = 1.2 * fontSize;
  
  // Add each page to the PDF
  for (const page of pages) {
    const pdfPage = pdfDoc.addPage([dimensions.width, dimensions.height]);
    const { width, height } = pdfPage.getSize();
    const maxWidth = width - 2 * margin;
    
    // Add page content
    const plainText = htmlToPlainText(page.content);
    const words = plainText.split(' ');
    
    let y = height - margin;
    let currentLine = '';
    
    // Add title on first page
    if (page.pageNumber === 1) {
      pdfPage.drawText(title, {
        x: margin,
        y: y,
        size: fontSize * 2,
        font: font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight * 3;
    }
    
    // Extract headings
    const headings = extractHeadings(page.content);
    if (headings.length > 0) {
      for (const heading of headings) {
        pdfPage.drawText(heading.text, {
          x: margin,
          y: y,
          size: fontSize * (1.5 - (heading.level - 1) * 0.2),
          font: font,
          color: rgb(0, 0, 0),
        });
        y -= lineHeight * 2;
      }
    }
    
    // Add text
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (textWidth > maxWidth) {
        pdfPage.drawText(currentLine, {
          x: margin,
          y: y,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        });
        currentLine = word;
        y -= lineHeight;
        
        // Add a new page if we've reached the bottom margin
        if (y < margin) {
          pdfPage.drawText(`${page.pageNumber}`, {
            x: width / 2,
            y: margin / 2,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
          const newPage = pdfDoc.addPage([dimensions.width, dimensions.height]);
          y = height - margin;
        }
      } else {
        currentLine = testLine;
      }
    }
    
    // Draw the last line
    if (currentLine) {
      pdfPage.drawText(currentLine, {
        x: margin,
        y: y,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
    }
    
    // Add page number at the bottom
    pdfPage.drawText(`${page.pageNumber}`, {
      x: width / 2,
      y: margin / 2,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    // Add image if it exists
    if (page.imageUrl) {
      try {
        const response = await fetch(page.imageUrl);
        const imageBuffer = await response.arrayBuffer();
        let image;
        
        if (page.imageUrl.endsWith('.jpg') || page.imageUrl.endsWith('.jpeg')) {
          image = await pdfDoc.embedJpg(imageBuffer);
        } else if (page.imageUrl.endsWith('.png')) {
          image = await pdfDoc.embedPng(imageBuffer);
        }
        
        if (image) {
          const imgDimensions = image.scale(0.5); // Scale down to 50%
          pdfPage.drawImage(image, {
            x: width / 2 - imgDimensions.width / 2,
            y: margin * 2,
            width: imgDimensions.width,
            height: imgDimensions.height,
          });
        }
      } catch (error) {
        console.error('Error adding image to PDF:', error);
      }
    }
  }
  
  return pdfDoc.save();
}

// Generate EPUB from book content
export async function generateEPUB(title: string, pages: BookPage[]): Promise<Buffer> {
  const tempFilePath = path.join(os.tmpdir(), `${Date.now()}_book.epub`);
  
  const content = pages.map(page => {
    let htmlContent = page.content;
    
    // Add image if it exists
    if (page.imageUrl) {
      htmlContent += `<div style="text-align: center; margin: 20px 0;"><img src="${page.imageUrl}" alt="Page illustration" style="max-width: 100%; height: auto;" /></div>`;
    }
    
    return {
      title: `Page ${page.pageNumber}`,
      data: htmlContent
    };
  });
  
  const options = {
    title: title,
    author: 'Prompt2Book',
    publisher: 'Prompt2Book',
    content: content
  };
  
  await new Promise((resolve, reject) => {
    new epub(options, tempFilePath).promise
      .then(resolve)
      .catch(reject);
  });
  
  const epubData = await readFileAsync(tempFilePath);
  await unlinkAsync(tempFilePath);
  
  return epubData;
}

// Generate DOCX from book content
export async function generateDOCX(title: string, pages: BookPage[]): Promise<Buffer> {
  const doc = new Document({
    title: title,
    creator: 'Prompt2Book',
    description: 'Generated by Prompt2Book',
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.TITLE,
          }),
          ...pages.flatMap(page => {
            // Parse HTML content
            const headings = extractHeadings(page.content);
            const plainText = htmlToPlainText(page.content);
            
            const paragraphs = [
              new Paragraph({
                text: `Page ${page.pageNumber}`,
                heading: HeadingLevel.HEADING_1,
              })
            ];
            
            // Add headings
            headings.forEach(heading => {
              paragraphs.push(
                new Paragraph({
                  text: heading.text,
                  heading: heading.level as HeadingLevel,
                })
              );
            });
            
            // Add text content
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun(plainText)
                ]
              })
            );
            
            // Add page break between pages
            paragraphs.push(
              new Paragraph({
                text: '',
                pageBreakBefore: true,
              })
            );
            
            return paragraphs;
          }),
        ],
      },
    ],
  });
  
  return Packer.toBuffer(doc);
}
