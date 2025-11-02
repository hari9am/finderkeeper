import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import { Issuer, Strategy, type TokenSet } from "openid-client";
import passport from "passport";

export async function registerRoutes(app: Express): Promise<Server> {
  // Replit Auth integration - blueprint:javascript_log_in_with_replit
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update item (must be the owner)
  app.put("/api/items/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params as { id: string };
      const userId = req.user.claims.sub as string;
      const existing = await storage.getItem(id);
      if (!existing) {
        return res.status(404).json({ message: "Item not found" });
      }
      if (existing.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const partialSchema = itemSchema.partial();
      const body = partialSchema.parse(req.body);
      const updates: any = { ...body };
      if (typeof body.date === "string") {
        let dateObj: Date;
        if (/^\d{2}-\d{2}-\d{4}$/.test(body.date)) {
          const [dd, mm, yyyy] = body.date.split("-");
          dateObj = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
        } else {
          const tmp = new Date(body.date);
          dateObj = isNaN(tmp.getTime()) ? new Date() : tmp;
        }
        updates.date = dateObj;
      }

      const updated = await storage.updateItem(id, updates);
      return res.json(updated);
    } catch (error: any) {
      if (error?.issues) {
        return res.status(400).json({ message: "Invalid item", issues: error.issues });
      }
      console.error("Error updating item:", error);
      return res.status(500).json({ message: "Failed to update item" });
    }
  });

  // Get single item by id (public)
  app.get("/api/items/:id", async (req, res) => {
    try {
      const { id } = req.params as { id: string };
      const item = await storage.getItem(id);
      if (!item) return res.status(404).json({ message: "Item not found" });
      res.json(item);
    } catch (error) {
      console.error("Error fetching item:", error);
      res.status(500).json({ message: "Failed to fetch item" });
    }
  });

  // Delete item (must be the owner)
  app.delete("/api/items/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params as { id: string };
      const userId = req.user.claims.sub as string;

      const item = await storage.getItem(id);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      if (item.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteItem(id);
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting item:", error);
      return res.status(500).json({ message: "Failed to delete item" });
    }
  });

  // Admin purge: delete ALL items (guarded by ADMIN_USER_ID)
  app.delete("/api/admin/items", isAuthenticated, async (req: any, res) => {
    try {
      const adminId = process.env.ADMIN_USER_ID;
      if (!adminId) {
        return res.status(500).json({ message: "ADMIN_USER_ID not set" });
      }
      const userId = req.user.claims.sub as string;
      if (userId !== adminId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      await storage.deleteAllItems();
      return res.status(204).end();
    } catch (error) {
      console.error("Error purging items:", error);
      return res.status(500).json({ message: "Failed to purge items" });
    }
  });

  // Google Login via OIDC (optional; requires GOOGLE_CLIENT_ID/SECRET)
  if (process.env.GOOGLE_CLIENT_ID) {
    const googleIssuer = await Issuer.discover("https://accounts.google.com");
    const port = parseInt(process.env.PORT || "5000", 10);
    const redirectUris: string[] = [];
    const baseOrigin = process.env.PUBLIC_ORIGIN || process.env.RENDER_EXTERNAL_URL;
    if (baseOrigin) {
      redirectUris.push(`${baseOrigin}/api/callback/google`);
    }
    // Add common local dev hosts to avoid mismatches
    redirectUris.push(
      `http://localhost:${port}/api/callback/google`,
      `http://127.0.0.1:${port}/api/callback/google`
    );

    const googleClient = new googleIssuer.Client({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uris: redirectUris,
      response_types: ["code"],
      token_endpoint_auth_method: "client_secret_post",
    });

    const googleStrategy = new Strategy(
      {
        client: googleClient,
        params: {
          scope: "openid email profile",
          // Explicitly set redirect_uri so Google receives it on the auth request
          redirect_uri: `${baseOrigin || `http://localhost:${port}`}/api/callback/google`,
        },
      },
      async (tokens: TokenSet, userinfo: any, verified: passport.AuthenticateCallback) => {
        const user = {} as any;
        // Reuse storage to upsert user keyed by email
        try {
          await storage.upsertUser({
            id: userinfo.sub,
            email: userinfo.email,
            firstName: userinfo.given_name,
            lastName: userinfo.family_name,
            profileImageUrl: userinfo.picture,
          });
        } catch {}
        (user as any).claims = userinfo;
        (user as any).access_token = tokens.access_token;
        (user as any).refresh_token = tokens.refresh_token;
        (user as any).expires_at = tokens.expires_at ?? userinfo?.exp;
        verified(null, user);
      }
    );
    passport.use("google", googleStrategy);

    app.get(
      "/api/login/google",
      passport.authenticate("google", {
        prompt: "select_account",
        scope: "openid email profile",
      })
    );
    app.get("/api/callback/google", (req, res, next) => {
      passport.authenticate("google", (err: any, user: any, info: any) => {
        if (err) {
          console.error("google callback error", err);
          return res.status(500).send("Google login failed");
        }
        if (!user) {
          return res.redirect("/");
        }
        req.logIn(user, (e: any) => {
          if (e) {
            console.error("google login session error", e);
            return res.status(500).send("Login session failed");
          }
          return res.redirect("/");
        });
      })(req, res, next);
    });
  }

  // Public Items API (no login required)
  const itemSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(1),
    description: z.string().min(1),
    category: z.string().min(1),
    location: z.string().min(1),
    date: z.string().min(1),
    imageUrl: z
      .string()
      .regex(/^(\/uploads|https?:)/, {
        message: "Invalid url",
      })
      .optional(),
    contactName: z.string().optional(),
    contactPhone: z.string().optional(),
    contactEmail: z.string().email().optional(),
    aiTags: z.any().optional(),
    status: z.enum(["lost", "found"]),
    userId: z.string().optional(),
  });

  app.get("/api/items", async (req, res) => {
    try {
      const items = await storage.getItems();
      res.json(items);
    } catch (error) {
      console.error("Error listing items:", error);
      res.status(500).json({ message: "Failed to list items" });
    }
  });

  // Current user's items
  app.get("/api/user/items", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const items = await storage.getUserItems(userId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching user items:", error);
      res.status(500).json({ message: "Failed to fetch user items" });
    }
  });

  app.post("/api/items", isAuthenticated, async (req, res) => {
    try {
      const body = itemSchema.parse(req.body);
      const userId = (req as any).user.claims.sub;
      // Normalize date: support dd-mm-yyyy and ISO formats
      let dateObj: Date;
      if (/^\d{2}-\d{2}-\d{4}$/.test(body.date)) {
        const [dd, mm, yyyy] = body.date.split("-");
        dateObj = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      } else {
        const tmp = new Date(body.date);
        dateObj = isNaN(tmp.getTime()) ? new Date() : tmp;
      }
      const created = await storage.createItem({
        ...body,
        userId,
        date: dateObj,
      } as any);
      res.status(201).json(created);
    } catch (error: any) {
      if (error?.issues) {
        return res.status(400).json({ message: "Invalid item", issues: error.issues });
      }
      console.error("Error creating item:", error);
      res.status(500).json({ message: "Failed to create item", error: String(error?.message || error) });
    }
  });

  // Ensure uploads directory exists
  const uploadsDir = path.resolve("uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  // Multer storage for file uploads
  const storageEngine = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".png";
      const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      cb(null, name);
    },
  });
  const upload = multer({ storage: storageEngine });

  // Upload endpoint
  app.post("/api/upload", upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });

  // AI analyze endpoint (optional)
  app.post("/api/analyze-image", async (req, res) => {
    try {
      const { imageUrl } = req.body as { imageUrl?: string };
      if (!imageUrl) return res.status(400).json({ message: "imageUrl required" });

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        // Fallback: simple heuristic or default
        return res.json({ category: "Uncategorized" });
      }

      const openai = new OpenAI({ apiKey });
      const categories = [
        "Wallets & Purses",
        "Keys",
        "Electronics",
        "Clothing",
        "Bags",
        "Jewelry",
        "Documents",
        "Pets",
        "Other",
      ];

      const prompt = `You are classifying an object in a photo into one of these categories: ${categories.join(", ")}. Return ONLY the category string.`;

      const resp = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: prompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Classify this image" },
              { type: "image_url", image_url: { url: imageUrl } as any },
            ] as any,
          },
        ],
      });

      const category = resp.choices?.[0]?.message?.content?.trim() || "Other";
      res.json({ category });
    } catch (err) {
      console.error("analyze-image error", err);
      res.json({ category: "Other" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
