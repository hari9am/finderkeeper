import { Link } from "wouter";
import { Search, Menu, Moon, Sun, User, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "./ThemeProvider";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 hover-elevate rounded-md px-3 py-2" data-testid="link-home">
            <Search className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">FindIt</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/browse" className="text-sm font-medium hover-elevate rounded-md px-3 py-2" data-testid="link-browse">
              Browse Items
            </Link>
            <Link href="/faq" className="text-sm font-medium hover-elevate rounded-md px-3 py-2" data-testid="link-faq">
              FAQ
            </Link>
            <Link href="/safety" className="text-sm font-medium hover-elevate rounded-md px-3 py-2" data-testid="link-safety">
              Safety Tips
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
              <Link href="/report">
                <Button data-testid="button-post-item">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Item
                </Button>
              </Link>
              {!isAuthenticated ? (
                <a href="/api/login/google">
                  <Button variant="outline" data-testid="button-login-google">Login</Button>
                </a>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-0 h-10 w-10 rounded-full" data-testid="button-user-menu">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "U"} />
                        <AvatarFallback>{(user?.firstName?.[0] || "U").toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href="/api/logout" className="flex items-center gap-2" data-testid="button-logout">
                        <LogOut className="w-4 h-4" /> Logout
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
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
              <Link href="/browse" className="text-sm font-medium hover-elevate rounded-md px-3 py-2" data-testid="link-mobile-browse" onClick={() => setMobileMenuOpen(false)}>
                Browse Items
              </Link>
              <Link href="/faq" className="text-sm font-medium hover-elevate rounded-md px-3 py-2" data-testid="link-mobile-faq" onClick={() => setMobileMenuOpen(false)}>
                FAQ
              </Link>
              <Link href="/safety" className="text-sm font-medium hover-elevate rounded-md px-3 py-2" data-testid="link-mobile-safety" onClick={() => setMobileMenuOpen(false)}>
                Safety Tips
              </Link>
              <div className="flex flex-col gap-2 mt-2">
                <Link href="/post" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full" data-testid="button-mobile-post">
                    <Plus className="w-4 h-4 mr-2" />
                    Post Item
                  </Button>
                </Link>
                {!isAuthenticated ? (
                  <a href="/api/login/google" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full" data-testid="button-mobile-login">Login</Button>
                  </a>
                ) : (
                  <a href="/api/logout" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full" data-testid="button-mobile-logout">Logout</Button>
                  </a>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
