import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertBookSchema, insertBookPageSchema } from "@shared/schema";
import { 
  hashPassword, 
  comparePassword, 
  generateAuthToken, 
  verifyAuthToken 
} from "./services/auth";
import { 
  generateBookContent,
  generatePageImage,
  compileBook 
} from "./services/book";
import { 
  createStripeCustomer,
  createCheckoutSession, 
  handleStripeWebhook,
  STRIPE_PRODUCTS,
  PLAN_LIMITS
} from "./services/stripe";
import passport from "passport";
import session from "express-session";
import MemoryStore from "memorystore";
import { v4 as uuidv4 } from "uuid";

const MemoryStoreSession = MemoryStore(session);

// User session data type
export interface UserSession {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  plan?: string;
}

// Middleware to check if user is authenticated
const authenticateUser = (req: Request, res: Response, next: Function) => {
  if (req.session && req.session.user) {
    return next();
  }
  
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "prompt2book-secret",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // 24 hours
      }),
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === "production",
      },
    })
  );
  
  // Passport initialization
  app.use(passport.initialize());
  app.use(passport.session());
  
  // User Routes
  
  // Sign up route
  app.post("/api/signup", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.extend({
        email: z.string().email(),
        fullName: z.string().optional(),
      }).parse(req.body);
      
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const hashedPassword = await hashPassword(userData.password);
      
      // Create Stripe customer
      const stripeCustomerId = await createStripeCustomer(userData.email, userData.fullName || userData.username);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        stripeCustomerId
      });
      
      // Create initial user limits for free plan
      await storage.createUserLimits({
        userId: user.id,
        booksRemaining: 1,
        pagesRemaining: 10,
        imageCredits: 0
      });
      
      // Set user in session
      if (req.session) {
        req.session.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          plan: user.plan
        };
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: String(error) });
    }
  });
  
  // Login route
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      const passwordMatch = await comparePassword(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Set user in session
      if (req.session) {
        req.session.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          plan: user.plan
        };
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });
  
  // Logout route
  app.post("/api/logout", (req: Request, res: Response) => {
    req.session?.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  
  // Get current user
  app.get("/api/user", (req: Request, res: Response) => {
    if (req.session && req.session.user) {
      return res.json(req.session.user);
    }
    res.status(401).json({ message: "Not authenticated" });
  });
  
  // Get user limits
  app.get("/api/user/limits", authenticateUser, async (req: Request, res: Response) => {
    try {
      const user = req.session!.user as UserSession;
      
      const userLimits = await storage.getUserLimits(user.id);
      if (!userLimits) {
        return res.status(404).json({ message: "User limits not found" });
      }
      
      // Add total limits based on plan
      let limitsWithTotal;
      switch (user.plan) {
        case STRIPE_PRODUCTS.CREATOR:
          limitsWithTotal = {
            ...userLimits,
            booksTotal: PLAN_LIMITS.CREATOR.booksRemaining,
            pagesTotal: PLAN_LIMITS.CREATOR.pagesRemaining,
            imageCreditsTotal: PLAN_LIMITS.CREATOR.imageCredits
          };
          break;
        case STRIPE_PRODUCTS.PRO:
          limitsWithTotal = {
            ...userLimits,
            booksTotal: PLAN_LIMITS.PRO.booksRemaining,
            pagesTotal: PLAN_LIMITS.PRO.pagesRemaining,
            imageCreditsTotal: PLAN_LIMITS.PRO.imageCredits
          };
          break;
        default: // Free plan
          limitsWithTotal = {
            ...userLimits,
            booksTotal: PLAN_LIMITS.FREE.booksRemaining,
            pagesTotal: PLAN_LIMITS.FREE.pagesRemaining,
            imageCreditsTotal: PLAN_LIMITS.FREE.imageCredits
          };
      }
      
      res.json(limitsWithTotal);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });
  
  // Book Routes
  
  // Create a new book
  app.post("/api/books", authenticateUser, async (req: Request, res: Response) => {
    try {
      const user = req.session!.user as UserSession;
      
      // Check user limits
      const userLimits = await storage.getUserLimits(user.id);
      if (!userLimits) {
        return res.status(400).json({ message: "User limits not found" });
      }
      
      if (userLimits.booksRemaining <= 0) {
        return res.status(400).json({ message: "You have reached your book limit. Please upgrade your plan." });
      }
      
      // Parse book data
      const bookData = insertBookSchema.parse({
        ...req.body,
        userId: user.id
      });
      
      // Create book
      const book = await storage.createBook(bookData);
      
      // Update user limits
      await storage.updateUserLimits(user.id, {
        booksRemaining: userLimits.booksRemaining - 1
      });
      
      // Generate book content in background
      generateBookContent(book, userLimits)
        .catch(console.error);
      
      res.status(201).json(book);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: String(error) });
    }
  });
  
  // Get all books for the user
  app.get("/api/books", authenticateUser, async (req: Request, res: Response) => {
    try {
      const user = req.session!.user as UserSession;
      const books = await storage.getBooksByUserId(user.id);
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });
  
  // Get recent books for the user
  app.get("/api/books/recent", authenticateUser, async (req: Request, res: Response) => {
    try {
      const user = req.session!.user as UserSession;
      const books = await storage.getRecentBooks(user.id, 5);
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });
  
  // Get a specific book
  app.get("/api/books/:id", authenticateUser, async (req: Request, res: Response) => {
    try {
      const user = req.session!.user as UserSession;
      const bookId = parseInt(req.params.id);
      
      if (isNaN(bookId)) {
        return res.status(400).json({ message: "Invalid book ID" });
      }
      
      const book = await storage.getBook(bookId);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      if (book.userId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to access this book" });
      }
      
      res.json(book);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });
  
  // Get pages for a book
  app.get("/api/books/:id/pages", authenticateUser, async (req: Request, res: Response) => {
    try {
      const user = req.session!.user as UserSession;
      const bookId = parseInt(req.params.id);
      
      if (isNaN(bookId)) {
        return res.status(400).json({ message: "Invalid book ID" });
      }
      
      const book = await storage.getBook(bookId);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      if (book.userId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to access this book" });
      }
      
      const pages = await storage.getBookPages(bookId);
      res.json(pages);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });
  
  // Update a book page
  app.patch("/api/books/pages/:id", authenticateUser, async (req: Request, res: Response) => {
    try {
      const user = req.session!.user as UserSession;
      const pageId = parseInt(req.params.id);
      
      if (isNaN(pageId)) {
        return res.status(400).json({ message: "Invalid page ID" });
      }
      
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }
      
      const page = await storage.getBookPage(pageId);
      
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      
      const book = await storage.getBook(page.bookId);
      
      if (!book || book.userId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to update this page" });
      }
      
      const updatedPage = await storage.updateBookPage(pageId, { content });
      res.json(updatedPage);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });
  
  // Regenerate image for a page
  app.post("/api/books/pages/:id/regenerate-image", authenticateUser, async (req: Request, res: Response) => {
    try {
      const user = req.session!.user as UserSession;
      const pageId = parseInt(req.params.id);
      
      if (isNaN(pageId)) {
        return res.status(400).json({ message: "Invalid page ID" });
      }
      
      const page = await storage.getBookPage(pageId);
      
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      
      const book = await storage.getBook(page.bookId);
      
      if (!book || book.userId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to update this page" });
      }
      
      // Check image credits
      const userLimits = await storage.getUserLimits(user.id);
      
      if (!userLimits || userLimits.imageCredits <= 0) {
        return res.status(400).json({ message: "You don't have any image credits left" });
      }
      
      // Generate image
      const imageUrl = await generatePageImage(page.content);
      
      // Update page with new image
      const updatedPage = await storage.updateBookPage(pageId, { imageUrl });
      
      // Update user limits
      await storage.updateUserLimits(user.id, {
        imageCredits: userLimits.imageCredits - 1
      });
      
      res.json(updatedPage);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });
  
  // Recompile a book
  app.post("/api/books/:id/recompile", authenticateUser, async (req: Request, res: Response) => {
    try {
      const user = req.session!.user as UserSession;
      const bookId = parseInt(req.params.id);
      
      if (isNaN(bookId)) {
        return res.status(400).json({ message: "Invalid book ID" });
      }
      
      const book = await storage.getBook(bookId);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      if (book.userId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to recompile this book" });
      }
      
      // Update book status
      await storage.updateBook(bookId, { status: "generating" });
      
      // Recompile book in the background
      compileBook(book)
        .then(async (urls) => {
          await storage.updateBook(bookId, {
            status: "completed",
            ...urls
          });
        })
        .catch(console.error);
      
      res.json({ message: "Book recompilation started" });
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });
  
  // Delete a book
  app.delete("/api/books/:id", authenticateUser, async (req: Request, res: Response) => {
    try {
      const user = req.session!.user as UserSession;
      const bookId = parseInt(req.params.id);
      
      if (isNaN(bookId)) {
        return res.status(400).json({ message: "Invalid book ID" });
      }
      
      const book = await storage.getBook(bookId);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      if (book.userId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this book" });
      }
      
      await storage.deleteBook(bookId);
      
      // Increment books remaining
      const userLimits = await storage.getUserLimits(user.id);
      
      if (userLimits) {
        let maxBooks;
        
        // Get max books allowed for the user's plan
        switch (user.plan) {
          case STRIPE_PRODUCTS.CREATOR:
            maxBooks = PLAN_LIMITS.CREATOR.booksRemaining;
            break;
          case STRIPE_PRODUCTS.PRO:
            maxBooks = PLAN_LIMITS.PRO.booksRemaining;
            break;
          default: // Free plan
            maxBooks = PLAN_LIMITS.FREE.booksRemaining;
        }
        
        // Only increment if below the max limit
        if (userLimits.booksRemaining < maxBooks) {
          await storage.updateUserLimits(user.id, {
            booksRemaining: userLimits.booksRemaining + 1
          });
          
          console.log(`Refunded book credit to user ${user.id}, now has ${userLimits.booksRemaining + 1} remaining`);
        }
      }
      
      res.json({ message: "Book deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });
  
  // Stripe Routes
  
  // Create checkout session
  app.post("/api/create-checkout-session", authenticateUser, async (req: Request, res: Response) => {
    try {
      const user = req.session!.user as UserSession;
      const { planId } = req.body;
      
      if (!planId) {
        return res.status(400).json({ message: "Plan ID is required" });
      }
      
      const fullUser = await storage.getUser(user.id);
      
      if (!fullUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get success and cancel URLs
      let domain = "http://localhost:5000";
      if (process.env.REPLIT_DOMAINS) {
        domain = `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`;
      }
      
      const successUrl = `${domain}/dashboard?checkout=success`;
      const cancelUrl = `${domain}/pricing?checkout=canceled`;
      
      // Create checkout session
      const session = await createCheckoutSession(
        fullUser.stripeCustomerId || "",
        planId,
        successUrl,
        cancelUrl
      );
      
      res.json({ url: session.url });
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });
  
  // Stripe webhook
  app.post("/api/webhook", async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    
    try {
      const event = await handleStripeWebhook(req.body, sig);
      
      // Handle the event
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          
          // Update user plan
          const user = await storage.getUserByStripeCustomerId(session.customer as string);
          
          if (user) {
            let plan = "free";
            
            if (session.metadata && session.metadata.plan) {
              plan = session.metadata.plan;
            }
            
            // Update user plan
            await storage.updateUser(user.id, { plan });
            
            // Get plan limits from centralized configuration
            let limitsConfig = PLAN_LIMITS.FREE;
            if (plan === STRIPE_PRODUCTS.CREATOR) {
              limitsConfig = PLAN_LIMITS.CREATOR;
            } else if (plan === STRIPE_PRODUCTS.PRO) {
              limitsConfig = PLAN_LIMITS.PRO;
            }
            
            // Update user limits
            await storage.updateUserLimits(user.id, {
              booksRemaining: limitsConfig.booksRemaining,
              pagesRemaining: limitsConfig.pagesRemaining,
              imageCredits: limitsConfig.imageCredits
            });
            
            console.log(`Updated user ${user.id} to plan: ${plan} with limits:`, limitsConfig);
          } else {
            console.error("No user found for Stripe customer ID:", session.customer);
          }
          
          break;
        }
        case "customer.subscription.updated": {
          const subscription = event.data.object;
          
          // Handle subscription updates (plan changes)
          const user = await storage.getUserByStripeCustomerId(subscription.customer as string);
          
          if (user) {
            // Get plan from subscription metadata or item
            const productId = subscription.items?.data[0]?.price?.product as string;
            let plan = "free";
            
            if (productId) {
              if (productId.includes("creator")) {
                plan = STRIPE_PRODUCTS.CREATOR;
              } else if (productId.includes("pro")) {
                plan = STRIPE_PRODUCTS.PRO;
              }
            }
            
            // Update user plan
            await storage.updateUser(user.id, { plan });
            
            // Get plan limits from centralized configuration
            let limitsConfig = PLAN_LIMITS.FREE;
            if (plan === STRIPE_PRODUCTS.CREATOR) {
              limitsConfig = PLAN_LIMITS.CREATOR;
            } else if (plan === STRIPE_PRODUCTS.PRO) {
              limitsConfig = PLAN_LIMITS.PRO;
            }
            
            // Update user limits
            await storage.updateUserLimits(user.id, {
              booksRemaining: limitsConfig.booksRemaining,
              pagesRemaining: limitsConfig.pagesRemaining,
              imageCredits: limitsConfig.imageCredits
            });
            
            console.log(`Updated user ${user.id} subscription to plan: ${plan}`);
          } else {
            console.error("No user found for Stripe customer ID:", subscription.customer);
          }
          
          break;
        }
        case "customer.subscription.deleted": {
          const subscription = event.data.object;
          
          // Downgrade user to free plan
          const user = await storage.getUserByStripeCustomerId(subscription.customer as string);
          
          if (user) {
            // Update user plan
            await storage.updateUser(user.id, { plan: STRIPE_PRODUCTS.FREE });
            
            // Update user limits to free tier
            await storage.updateUserLimits(user.id, PLAN_LIMITS.FREE);
            
            console.log(`Downgraded user ${user.id} to free plan`);
          } else {
            console.error("No user found for Stripe customer ID:", subscription.customer);
          }
          
          break;
        }
      }
      
      res.json({ received: true, success: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(400).send(`Webhook Error: ${error}`);
    }
  });

  return httpServer;
}
