import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  stripeCustomerId: text("stripe_customer_id"),
  plan: text("plan").default("free").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  fullName: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  prompt: text("prompt").notNull(),
  format: text("format").notNull(), // PDF, EPUB, DOCX
  pageSize: text("page_size").notNull(), // A4, A5, etc.
  includeImages: boolean("include_images").default(false).notNull(),
  status: text("status").default("draft").notNull(), // draft, generating, completed
  pages: integer("pages").default(0),
  pdfUrl: text("pdf_url"),
  epubUrl: text("epub_url"),
  docxUrl: text("docx_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBookSchema = createInsertSchema(books).pick({
  userId: true,
  title: true,
  prompt: true,
  format: true,
  pageSize: true,
  includeImages: true,
});

export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof books.$inferSelect;

export const bookPages = pgTable("book_pages", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull(),
  pageNumber: integer("page_number").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBookPageSchema = createInsertSchema(bookPages).pick({
  bookId: true,
  pageNumber: true,
  content: true,
  imageUrl: true,
});

export type InsertBookPage = z.infer<typeof insertBookPageSchema>;
export type BookPage = typeof bookPages.$inferSelect;

export const userLimits = pgTable("user_limits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  booksRemaining: integer("books_remaining").notNull(),
  pagesRemaining: integer("pages_remaining").notNull(),
  imageCredits: integer("image_credits").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserLimitsSchema = createInsertSchema(userLimits).pick({
  userId: true,
  booksRemaining: true,
  pagesRemaining: true,
  imageCredits: true,
});

export type InsertUserLimits = z.infer<typeof insertUserLimitsSchema>;
export type UserLimits = typeof userLimits.$inferSelect;
