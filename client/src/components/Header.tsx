import { Link } from "wouter";
import { Search, Menu, Moon, Sun, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";
import { useState } from "react";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/">
            <a className="flex items-center gap-2 hover-elevate rounded-md px-3 py-2" data-testid="link-home">
              <Search className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold">FindIt</span>
            </a>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/browse">
              <a className="text-sm font-medium hover-elevate rounded-md px-3 py-2" data-testid="link-browse">
                Browse Items
              </a>
            </Link>
            <Link href="/faq">
              <a className="text-sm font-medium hover-elevate rounded-md px-3 py-2" data-testid="link-faq">
                FAQ
              </a>
            </Link>
            <Link href="/safety">
              <a className="text-sm font-medium hover-elevate rounded-md px-3 py-2" data-testid="link-safety">
                Safety Tips
              </a>
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>

            <div className="hidden md:flex items-center gap-2">
              <Button variant="outline" data-testid="button-login">
                <User className="w-4 h-4 mr-2" />
                Login
              </Button>
              <Button data-testid="button-post-item">
                <Plus className="w-4 h-4 mr-2" />
                Post Item
              </Button>
            </div>

            <Button
              size="icon"
              variant="ghost"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-2">
              <Link href="/browse">
                <a className="text-sm font-medium hover-elevate rounded-md px-3 py-2" data-testid="link-mobile-browse">
                  Browse Items
                </a>
              </Link>
              <Link href="/faq">
                <a className="text-sm font-medium hover-elevate rounded-md px-3 py-2" data-testid="link-mobile-faq">
                  FAQ
                </a>
              </Link>
              <Link href="/safety">
                <a className="text-sm font-medium hover-elevate rounded-md px-3 py-2" data-testid="link-mobile-safety">
                  Safety Tips
                </a>
              </Link>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" className="flex-1" data-testid="button-mobile-login">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
                <Button className="flex-1" data-testid="button-mobile-post">
                  <Plus className="w-4 h-4 mr-2" />
                  Post
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
