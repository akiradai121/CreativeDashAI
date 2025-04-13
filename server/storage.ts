import { 
  users, 
  books, 
  bookPages, 
  userLimits, 
  type User, 
  type InsertUser, 
  type Book, 
  type InsertBook, 
  type BookPage, 
  type InsertBookPage, 
  type UserLimits, 
  type InsertUserLimits 
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined>;
  createUser(user: InsertUser & { stripeCustomerId?: string }): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  
  // Book methods
  createBook(book: InsertBook): Promise<Book>;
  getBook(id: number): Promise<Book | undefined>;
  getBooksByUserId(userId: number): Promise<Book[]>;
  getRecentBooks(userId: number, limit: number): Promise<Book[]>;
  updateBook(id: number, bookData: Partial<Book>): Promise<Book>;
  deleteBook(id: number): Promise<void>;
  
  // Book page methods
  createBookPage(page: InsertBookPage): Promise<BookPage>;
  getBookPage(id: number): Promise<BookPage | undefined>;
  getBookPages(bookId: number): Promise<BookPage[]>;
  updateBookPage(id: number, pageData: Partial<BookPage>): Promise<BookPage>;
  deleteBookPage(id: number): Promise<void>;
  
  // User limits methods
  createUserLimits(limits: InsertUserLimits): Promise<UserLimits>;
  getUserLimits(userId: number): Promise<UserLimits | undefined>;
  updateUserLimits(userId: number, limitsData: Partial<UserLimits>): Promise<UserLimits>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private books: Map<number, Book>;
  private bookPages: Map<number, BookPage>;
  private userLimitsMap: Map<number, UserLimits>;
  
  private userId: number;
  private bookId: number;
  private pageId: number;
  private limitsId: number;
  
  constructor() {
    this.users = new Map();
    this.books = new Map();
    this.bookPages = new Map();
    this.userLimitsMap = new Map();
    
    this.userId = 1;
    this.bookId = 1;
    this.pageId = 1;
    this.limitsId = 1;
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  
  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.stripeCustomerId === stripeCustomerId
    );
  }
  
  async createUser(userData: InsertUser & { stripeCustomerId?: string }): Promise<User> {
    const now = new Date();
    const id = this.userId++;
    const user: User = {
      ...userData,
      id,
      plan: "free",
      createdAt: now,
      stripeCustomerId: userData.stripeCustomerId || null
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Book methods
  async createBook(bookData: InsertBook): Promise<Book> {
    const now = new Date();
    const id = this.bookId++;
    const book: Book = {
      ...bookData,
      id,
      status: "draft",
      pages: 0,
      pdfUrl: null,
      epubUrl: null,
      docxUrl: null,
      createdAt: now,
      updatedAt: now
    };
    this.books.set(id, book);
    return book;
  }
  
  async getBook(id: number): Promise<Book | undefined> {
    return this.books.get(id);
  }
  
  async getBooksByUserId(userId: number): Promise<Book[]> {
    return Array.from(this.books.values())
      .filter((book) => book.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }
  
  async getRecentBooks(userId: number, limit: number): Promise<Book[]> {
    return Array.from(this.books.values())
      .filter((book) => book.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);
  }
  
  async updateBook(id: number, bookData: Partial<Book>): Promise<Book> {
    const book = await this.getBook(id);
    if (!book) {
      throw new Error("Book not found");
    }
    
    const updatedBook = { 
      ...book, 
      ...bookData,
      updatedAt: new Date()
    };
    this.books.set(id, updatedBook);
    return updatedBook;
  }
  
  async deleteBook(id: number): Promise<void> {
    // Delete all book pages first
    const pages = await this.getBookPages(id);
    for (const page of pages) {
      await this.deleteBookPage(page.id);
    }
    
    // Then delete the book
    this.books.delete(id);
  }
  
  // Book page methods
  async createBookPage(pageData: InsertBookPage): Promise<BookPage> {
    const now = new Date();
    const id = this.pageId++;
    const page: BookPage = {
      ...pageData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.bookPages.set(id, page);
    
    // Update book pages count
    const book = await this.getBook(pageData.bookId);
    if (book) {
      await this.updateBook(book.id, { pages: book.pages + 1 });
    }
    
    return page;
  }
  
  async getBookPage(id: number): Promise<BookPage | undefined> {
    return this.bookPages.get(id);
  }
  
  async getBookPages(bookId: number): Promise<BookPage[]> {
    return Array.from(this.bookPages.values())
      .filter((page) => page.bookId === bookId)
      .sort((a, b) => a.pageNumber - b.pageNumber);
  }
  
  async updateBookPage(id: number, pageData: Partial<BookPage>): Promise<BookPage> {
    const page = await this.getBookPage(id);
    if (!page) {
      throw new Error("Page not found");
    }
    
    const updatedPage = { 
      ...page, 
      ...pageData,
      updatedAt: new Date()
    };
    this.bookPages.set(id, updatedPage);
    return updatedPage;
  }
  
  async deleteBookPage(id: number): Promise<void> {
    const page = await this.getBookPage(id);
    if (page) {
      // Update book pages count
      const book = await this.getBook(page.bookId);
      if (book) {
        await this.updateBook(book.id, { pages: Math.max(0, book.pages - 1) });
      }
    }
    
    this.bookPages.delete(id);
  }
  
  // User limits methods
  async createUserLimits(limitsData: InsertUserLimits): Promise<UserLimits> {
    const now = new Date();
    const id = this.limitsId++;
    const limits: UserLimits = {
      ...limitsData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.userLimitsMap.set(limitsData.userId, limits);
    return limits;
  }
  
  async getUserLimits(userId: number): Promise<UserLimits | undefined> {
    return this.userLimitsMap.get(userId);
  }
  
  async updateUserLimits(userId: number, limitsData: Partial<UserLimits>): Promise<UserLimits> {
    const limits = await this.getUserLimits(userId);
    if (!limits) {
      throw new Error("User limits not found");
    }
    
    const updatedLimits = { 
      ...limits, 
      ...limitsData,
      updatedAt: new Date()
    };
    this.userLimitsMap.set(userId, updatedLimits);
    return updatedLimits;
  }
}

export const storage = new MemStorage();
