import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function LoginDialog() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setOpen(true);
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) return null;

  // Show welcome message for authenticated users
  if (isAuthenticated && user) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome Back!</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-4 py-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
              <AvatarFallback className="text-2xl">
                {(user.firstName?.[0] || user.email?.[0] || "U").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">
                Continue as {user.firstName || user.email?.split('@')[0] || "User"}
              </p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button onClick={() => setOpen(false)}>Continue</Button>
            <Button variant="outline" asChild>
              <a href="/api/logout">Switch Account</a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome to FindIt</DialogTitle>
          <DialogDescription>
            Log in to post items, manage your dashboard, and get the best experience.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex gap-2 justify-end">
          <a href="/api/login/google">
            <Button>Login with Google</Button>
          </a>
          <Button variant="outline" onClick={() => setOpen(false)}>Maybe later</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
