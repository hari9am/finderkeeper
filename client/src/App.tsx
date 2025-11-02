import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Browse from "@/pages/Browse";
import FAQ from "@/pages/FAQ";
import Safety from "@/pages/Safety";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";
import Post from "@/pages/Post";
import Report from "@/pages/Report";
import LoginDialog from "@/components/LoginDialog";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/browse" component={Browse} />
      <Route path="/faq" component={FAQ} />
      <Route path="/safety" component={Safety} />
      <Route path="/post" component={Post} />
      <Route path="/post/:id" component={Post} />
      <Route path="/report" component={Report} />
      <Route path="/dashboard">
        <Dashboard />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              <Router />
            </main>
            <Footer />
          </div>
          <LoginDialog />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
