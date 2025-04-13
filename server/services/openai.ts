import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPEN_API_KEY || "your-openai-api-key",
});

// Get completion from OpenAI
export async function getOpenAICompletion(prompt: string): Promise<string> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024.
    // do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error getting OpenAI completion:", error);
    throw new Error(`Failed to generate text: ${error}`);
  }
}

// Generate an image using DALL-E
export async function generateDallEImage(prompt: string): Promise<string> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    return response.data[0].url || "";
  } catch (error) {
    console.error("Error generating DALL-E image:", error);
    throw new Error(`Failed to generate image: ${error}`);
  }
}

// Generate multiple book pages
export async function generateBookPages(
  prompt: string,
  numPages: number
): Promise<{ content: string }[]> {
  const bookPrompt = `
    Create a ${numPages}-page book based on the following prompt: "${prompt}"
    
    Format your response as a JSON array of pages, where each page has a 'content' property with HTML-formatted text.
    Example format:
    [
      { "content": "<h1>Title</h1><p>Page content here...</p>" },
      { "content": "<h2>Chapter 1</h2><p>More content here...</p>" },
      ...
    ]
    
    Make sure each page contains valid HTML with appropriate heading tags, paragraphs, etc.
    Keep each page's content concise enough to fit on a single physical page.
    Do not use any external images or links.
  `;

  const completion = await getOpenAICompletion(bookPrompt);
  
  try {
    return JSON.parse(completion);
  } catch (error) {
    console.error("Error parsing book pages JSON:", error);
    
    // Fallback: create simple pages
    return Array.from({ length: numPages }, (_, i) => ({
      content: `<h2>Page ${i + 1}</h2><p>Content generated from your prompt: "${prompt}"</p>`
    }));
  }
}

// Generate image description based on content
export async function generateImageDescription(content: string): Promise<string> {
  const imagePrompt = `
    Based on the following text, create a concise and specific description for an image that would complement this content.
    Keep your description under 100 words and focused on visual elements.
    
    Text: "${content.substring(0, 500)}..."
  `;

  return getOpenAICompletion(imagePrompt);
}
