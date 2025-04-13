import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import CreateBook from "@/pages/create-book";
import EditBook from "@/pages/edit-book";
import ViewBook from "@/pages/view-book";
import Pricing from "@/pages/pricing";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "./lib/auth-context";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/create-book" component={CreateBook} />
      <Route path="/edit-book/:id" component={EditBook} />
      <Route path="/view-book/:id" component={ViewBook} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
