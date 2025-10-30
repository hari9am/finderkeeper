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
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

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
              {isAuthenticated && user ? (
                <>
                  <Link href="/post">
                    <Button data-testid="button-post-item">
                      <Plus className="w-4 h-4 mr-2" />
                      Post Item
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="button-user-menu">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} className="object-cover" />
                          <AvatarFallback>{user.firstName?.[0] || user.email?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.email}
                          </p>
                          {user.email && (
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          )}
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="w-full cursor-pointer" data-testid="link-dashboard">
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                        <LogOut className="w-4 h-4 mr-2" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button variant="outline" onClick={handleLogin} data-testid="button-login">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
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
              <Link href="/browse" className="text-sm font-medium hover-elevate rounded-md px-3 py-2" data-testid="link-mobile-browse">
                Browse Items
              </Link>
              <Link href="/faq" className="text-sm font-medium hover-elevate rounded-md px-3 py-2" data-testid="link-mobile-faq">
                FAQ
              </Link>
              <Link href="/safety" className="text-sm font-medium hover-elevate rounded-md px-3 py-2" data-testid="link-mobile-safety">
                Safety Tips
              </Link>
              {isAuthenticated && user ? (
                <div className="flex flex-col gap-2 mt-2">
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full justify-start" data-testid="button-mobile-dashboard">
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/post">
                    <Button className="w-full" data-testid="button-mobile-post">
                      <Plus className="w-4 h-4 mr-2" />
                      Post Item
                    </Button>
                  </Link>
                  <Button variant="ghost" onClick={handleLogout} className="w-full justify-start" data-testid="button-mobile-logout">
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </Button>
                </div>
              ) : (
                <Button variant="outline" onClick={handleLogin} className="w-full mt-2" data-testid="button-mobile-login">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
