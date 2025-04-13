import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  BookText, 
  Sparkles, 
  Download, 
  Pencil, 
  ImagePlus,
  Braces,
  Clock,
  Check
} from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white bg-opacity-95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <BookText className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold text-gray-900 font-poppins">
                  Prompt<span className="text-primary">2Book</span>
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium">
                Pricing
              </Link>
              <Link href="/auth">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/auth">
                <Button>Get Started <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 sm:pt-32 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl font-poppins">
                Turn your prompts into beautifully formatted books
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Prompt2Book is an AI-powered platform that transforms your simple text prompts into
                fully structured, export-ready books with custom formatting and optional AI-generated images.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/auth">
                  <Button size="lg" className="rounded-full px-8">
                    Start Creating <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="ghost" size="lg">
                    View pricing
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Hero Image */}
        <motion.div 
          className="mt-16 flow-root sm:mt-24"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
            <div className="rounded-lg shadow-2xl ring-1 ring-gray-900/10">
              <img
                src="https://cdn.dribbble.com/userupload/4799686/file/original-72f2a08e2b60f3c5df14fe3e5c8324d9.png?compress=1&resize=1600x1200"
                alt="Book creation interface"
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-poppins">
              Powerful features to unleash your creativity
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Everything you need to create professional books without any design or writing experience.
            </p>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 font-poppins">AI Content Generation</h3>
              <p className="mt-2 text-gray-600">
                Transform simple text prompts into complete books with AI-powered content generation.
              </p>
            </div>

            <div className="flex flex-col">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 font-poppins">Multiple Export Formats</h3>
              <p className="mt-2 text-gray-600">
                Download your book in PDF, EPUB, or DOCX formats with perfect formatting.
              </p>
            </div>

            <div className="flex flex-col">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <Pencil className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 font-poppins">Full Editing Freedom</h3>
              <p className="mt-2 text-gray-600">
                Complete control to edit and refine every page before downloading.
              </p>
            </div>

            <div className="flex flex-col">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <ImagePlus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 font-poppins">AI Image Generation</h3>
              <p className="mt-2 text-gray-600">
                Enhance your books with beautiful AI-generated images that match your content.
              </p>
            </div>

            <div className="flex flex-col">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <Braces className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 font-poppins">No-Code Required</h3>
              <p className="mt-2 text-gray-600">
                Create professional books without any technical knowledge or design skills.
              </p>
            </div>

            <div className="flex flex-col">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 font-poppins">Save Time</h3>
              <p className="mt-2 text-gray-600">
                Create complete books in minutes rather than weeks or months.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section Preview */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-poppins">
              Simple, transparent pricing
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Choose the plan that's right for you
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 sm:mt-20 sm:gap-y-0 sm:grid-cols-3 lg:max-w-4xl">
            {/* Free Plan */}
            <div className="rounded-tl-lg rounded-tr-lg sm:rounded-tr-none relative flex flex-col border border-gray-200 bg-white p-6 sm:border-r-0 sm:rounded-tl-lg">
              <div className="mb-5">
                <h3 className="text-lg font-semibold leading-8 text-gray-900 font-poppins">Free</h3>
                <p className="mt-4 flex items-baseline gap-x-2">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">$0</span>
                  <span className="text-base text-gray-500">/month</span>
                </p>
                <p className="mt-4 text-sm leading-6 text-gray-500">Try out Prompt2Book with basic features.</p>
              </div>
              <div className="mt-2 mb-6 space-y-4">
                <div className="flex gap-x-3">
                  <Check className="h-5 w-5 flex-none text-primary" />
                  <span className="text-sm text-gray-600">1 book</span>
                </div>
                <div className="flex gap-x-3">
                  <Check className="h-5 w-5 flex-none text-primary" />
                  <span className="text-sm text-gray-600">10 pages per book</span>
                </div>
                <div className="flex gap-x-3">
                  <Check className="h-5 w-5 flex-none text-primary" />
                  <span className="text-sm text-gray-600">Basic editing</span>
                </div>
              </div>
              <Link href="/auth" className="mt-auto">
                <Button variant="outline" className="w-full">Get started</Button>
              </Link>
            </div>

            {/* Creator Plan */}
            <div className="relative flex flex-col border-2 border-primary bg-white p-6 shadow-sm sm:rounded-none z-10">
              <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-primary py-1 text-center text-sm font-semibold text-white">
                Most popular
              </div>
              <div className="mb-5">
                <h3 className="text-lg font-semibold leading-8 text-gray-900 font-poppins">Creator</h3>
                <p className="mt-4 flex items-baseline gap-x-2">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">$9.99</span>
                  <span className="text-base text-gray-500">/month</span>
                </p>
                <p className="mt-4 text-sm leading-6 text-gray-500">Perfect for authors and content creators.</p>
              </div>
              <div className="mt-2 mb-6 space-y-4">
                <div className="flex gap-x-3">
                  <Check className="h-5 w-5 flex-none text-primary" />
                  <span className="text-sm text-gray-600">5 books</span>
                </div>
                <div className="flex gap-x-3">
                  <Check className="h-5 w-5 flex-none text-primary" />
                  <span className="text-sm text-gray-600">200 pages total</span>
                </div>
                <div className="flex gap-x-3">
                  <Check className="h-5 w-5 flex-none text-primary" />
                  <span className="text-sm text-gray-600">10 image credits</span>
                </div>
                <div className="flex gap-x-3">
                  <Check className="h-5 w-5 flex-none text-primary" />
                  <span className="text-sm text-gray-600">Advanced editing</span>
                </div>
              </div>
              <Link href="/pricing" className="mt-auto">
                <Button className="w-full">Upgrade now</Button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="rounded-bl-lg rounded-br-lg sm:rounded-bl-none relative flex flex-col border border-gray-200 bg-white p-6 sm:border-l-0 sm:rounded-br-lg">
              <div className="mb-5">
                <h3 className="text-lg font-semibold leading-8 text-gray-900 font-poppins">Pro</h3>
                <p className="mt-4 flex items-baseline gap-x-2">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">$19.99</span>
                  <span className="text-base text-gray-500">/month</span>
                </p>
                <p className="mt-4 text-sm leading-6 text-gray-500">For serious authors and publishers.</p>
              </div>
              <div className="mt-2 mb-6 space-y-4">
                <div className="flex gap-x-3">
                  <Check className="h-5 w-5 flex-none text-primary" />
                  <span className="text-sm text-gray-600">Unlimited books</span>
                </div>
                <div className="flex gap-x-3">
                  <Check className="h-5 w-5 flex-none text-primary" />
                  <span className="text-sm text-gray-600">1,000 pages total</span>
                </div>
                <div className="flex gap-x-3">
                  <Check className="h-5 w-5 flex-none text-primary" />
                  <span className="text-sm text-gray-600">50 image credits</span>
                </div>
                <div className="flex gap-x-3">
                  <Check className="h-5 w-5 flex-none text-primary" />
                  <span className="text-sm text-gray-600">Premium editing</span>
                </div>
              </div>
              <Link href="/pricing" className="mt-auto">
                <Button variant="outline" className="w-full">Learn more</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 sm:py-24 bg-primary-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-poppins">
              Ready to start creating?
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Join thousands of authors creating beautiful books with Prompt2Book.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/auth">
                <Button size="lg" className="rounded-full px-8">
                  Get Started for Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">GitHub</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-500">
              &copy; 2023 Prompt2Book. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
