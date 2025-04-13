import { apiRequest } from "./queryClient";

// Authentication APIs
export const signUp = async (userData: { 
  username: string;
  email: string;
  password: string;
  fullName?: string;
}) => {
  const response = await apiRequest("POST", "/api/signup", userData);
  return response.json();
};

export const login = async (credentials: { username: string; password: string }) => {
  const response = await apiRequest("POST", "/api/login", credentials);
  return response.json();
};

export const logout = async () => {
  return apiRequest("POST", "/api/logout");
};

export const getCurrentUser = async () => {
  const response = await apiRequest("GET", "/api/user");
  return response.json();
};

// Book APIs
export const createBook = async (bookData: {
  userId: number;
  title: string;
  prompt: string;
  format: string;
  pageSize: string;
  includeImages: boolean;
}) => {
  const response = await apiRequest("POST", "/api/books", bookData);
  return response.json();
};

export const getBooks = async () => {
  const response = await apiRequest("GET", "/api/books");
  return response.json();
};

export const getBook = async (bookId: number) => {
  const response = await apiRequest("GET", `/api/books/${bookId}`);
  return response.json();
};

export const getBookPages = async (bookId: number) => {
  const response = await apiRequest("GET", `/api/books/${bookId}/pages`);
  return response.json();
};

export const updateBookPage = async (pageId: number, content: string) => {
  const response = await apiRequest("PATCH", `/api/books/pages/${pageId}`, { content });
  return response.json();
};

export const regeneratePageImage = async (pageId: number) => {
  const response = await apiRequest("POST", `/api/books/pages/${pageId}/regenerate-image`);
  return response.json();
};

export const recompileBook = async (bookId: number) => {
  const response = await apiRequest("POST", `/api/books/${bookId}/recompile`);
  return response.json();
};

export const deleteBook = async (bookId: number) => {
  return apiRequest("DELETE", `/api/books/${bookId}`);
};

// User limits APIs
export const getUserLimits = async () => {
  const response = await apiRequest("GET", "/api/user/limits");
  return response.json();
};

// Stripe payment APIs
export const createCheckoutSession = async (planId: string) => {
  const response = await apiRequest("POST", "/api/create-checkout-session", { planId });
  return response.json();
};
