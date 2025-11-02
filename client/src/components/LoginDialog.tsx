import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function LoginDialog() {
  const { isAuthenticated, isLoading } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setOpen(true);
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading || isAuthenticated) return null;

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
            <Button>Login</Button>
          </a>
          <Button variant="outline" onClick={() => setOpen(false)}>Maybe later</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
