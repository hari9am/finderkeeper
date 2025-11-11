import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./mongoStorage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import multer from "multer";
import OpenAI from "openai";
import { Issuer, Strategy, type TokenSet } from "openid-client";
import passport from "passport";
import { sendEmail } from "./email";
import { buildItemEmbedding, cosineSimilarity } from "./ai";

// Helper to get user's display name (firstName or extracted from email)
function getUserDisplayName(user: any): string {
  if (user?.firstName) return user.firstName;
  if (user?.email) {
    const localPart = user.email.split('@')[0];
    const namePart = localPart.replace(/[0-9]/g, '').split(/[._-]/)[0];
    if (namePart) {
      return namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();
    }
  }
  return "there";
}

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

  // Update user profile
  app.put("/api/user/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName, phone } = req.body;
      
      const updatedUser = await storage.upsertUser({
        id: userId,
        firstName,
        lastName,
        phone,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
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
      const updates: any = {};
      // Whitelist fields we allow to change
      const fields: Array<keyof typeof body> = [
        "title",
        "description",
        "category",
        "location",
        "date",
        "imageUrl",
        "contactName",
        "contactPhone",
        "status",
      ];
      for (const k of fields) {
        const v = (body as any)[k];
        if (typeof v !== "undefined") {
          (updates as any)[k] = v;
        }
      }
      if (typeof updates.date === "string") {
        let dateObj: Date;
        if (/^\d{2}-\d{2}-\d{4}$/.test(updates.date)) {
          const [dd, mm, yyyy] = (updates.date as string).split("-");
          dateObj = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
        } else {
          const tmp = new Date(updates.date as string);
          dateObj = isNaN(tmp.getTime()) ? new Date() : tmp;
        }
        updates.date = dateObj;
      }

      // Debug: log what is being updated (can be removed later)
      try { console.debug("PUT /api/items updates", { id, updates }); } catch {}

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
    try {
      console.log("🔍 Discovering Google OIDC issuer...");
      const googleIssuer = await Promise.race([
        Issuer.discover("https://accounts.google.com"),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Google OIDC discovery timeout")), 10000)
        )
      ]) as any;
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
        // Extract name from email if given_name not provided
        const extractNameFromEmail = (email?: string): string | undefined => {
          if (!email) return undefined;
          const localPart = email.split('@')[0];
          const namePart = localPart.replace(/[0-9]/g, '').split(/[._-]/)[0];
          if (!namePart) return undefined;
          return namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();
        };
        
        const extractedName = extractNameFromEmail(userinfo.email);
        
        // Reuse storage to upsert user keyed by email
        try {
          await storage.upsertUser({
            id: userinfo.sub,
            email: userinfo.email,
            firstName: userinfo.given_name || extractedName,
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
    
    console.log("✅ Google OIDC configured successfully");
    } catch (error) {
      console.warn("⚠️ Failed to configure Google OIDC:", error instanceof Error ? error.message : String(error));
      console.log("🔄 Continuing without Google authentication...");
    }
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
      // allow:
      // - server-side uploaded files served from /uploads
      // - absolute http(s) URLs
      // - data: URLs (base64 inline images returned by /api/upload)
      .regex(/^(\/uploads|https?:|data:)/, {
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

  // Get user notifications
  app.get("/api/user/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log(`[NOTIFICATIONS] Fetching notifications for user ${userId}`);
      const notifications = await storage.getUserNotifications(userId);
      console.log(`[NOTIFICATIONS] Found ${notifications.length} notifications for user ${userId}`);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Get unread notification count
  app.get("/api/user/notifications/count", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching notification count:", error);
      res.status(500).json({ message: "Failed to fetch notification count" });
    }
  });

  // Mark notification as read
  app.patch("/api/user/notifications/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      await storage.markNotificationAsRead(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Mark all notifications as read
  app.patch("/api/user/notifications/read-all", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // Clear notification history
  app.delete("/api/user/notifications/clear", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.clearNotificationHistory(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error clearing notification history:", error);
      res.status(500).json({ message: "Failed to clear notification history" });
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
      // Build embedding for improved AI matching (best-effort)
      let embedding: number[] | undefined = undefined;
      try {
        console.log(`[AI DEBUG] Building embedding for new item: "${body.title}"`);
        embedding = await buildItemEmbedding({
          title: body.title,
          description: body.description,
          category: body.category,
          location: body.location,
          imageUrl: body.imageUrl,
        });
        console.log(`[AI DEBUG] Embedding created successfully: ${embedding ? 'yes' : 'no'} (length: ${embedding?.length || 0})`);
      } catch (error) {
        console.error(`[AI DEBUG] Failed to create embedding:`, error);
      }
      const created = await storage.createItem({
        ...body,
        userId,
        date: dateObj,
        embedding,
      } as any);

      // AI-powered matching: notify opposite-status owners for potential matches
      try {
        console.log(`[AI MATCHING] Starting AI matching for new ${body.status} item: "${body.title}"`);
        const oppositeStatus = body.status === "lost" ? "found" : "lost";
        const candidates = await storage.getItems({ status: oppositeStatus, category: body.category });
        console.log(`[AI MATCHING] Found ${candidates.length} candidates with opposite status (${oppositeStatus}) in category ${body.category}`);

        const norm = (s?: string) => (s || "").toLowerCase();
        const words = (s?: string) => Array.from(new Set(norm(s).split(/[^a-z0-9]+/).filter(Boolean)));

        const createdWords = new Set([
          ...words(created.title),
          ...words(created.description),
        ]);

        const createdEmbedding = (created as any).embedding as number[] | undefined;

        // Score and filter candidates
        const scored = candidates
          .map((cand) => {
            const candEmbedding = (cand as any).embedding as number[] | undefined;
            const aiSimilarity = createdEmbedding && candEmbedding ? cosineSimilarity(createdEmbedding, candEmbedding) : 0;

            // Improved location matching
            const locA = norm(created.location);
            const locB = norm(cand.location);
            let locationScore = 0;
            if (locA && locB) {
              // Exact match gets highest score
              if (locA === locB) {
                locationScore = 0.25;
              }
              // Partial match (one contains the other)
              else if (locA.includes(locB) || locB.includes(locA)) {
                locationScore = 0.2;
              }
              // Similar words in location (for nearby areas)
              else {
                const locWordsA = new Set(locA.split(/[^a-z0-9]+/).filter(Boolean));
                const locWordsB = new Set(locB.split(/[^a-z0-9]+/).filter(Boolean));
                let commonLocWords = 0;
                for (const word of locWordsA) {
                  if (locWordsB.has(word)) commonLocWords++;
                }
                if (commonLocWords >= 2) locationScore = 0.15;
                else if (commonLocWords >= 1) locationScore = 0.1;
              }
            }

            // Word overlap with higher weight
            let overlap = 0;
            for (const w of words(cand.title + " " + cand.description)) {
              if (createdWords.has(w)) overlap++;
            }

            // Category exact match bonus
            const categoryMatch = created.category.toLowerCase() === cand.category.toLowerCase() ? 0.1 : 0;

            // Combined score: AI similarity + location score + word overlap + category match
            const score = aiSimilarity + locationScore + Math.min(overlap, 5) * 0.05 + categoryMatch;
            
            // Debug logging for potential matches
            if (score > 0.1) {
              console.log(`[MATCH DEBUG] Candidate "${cand.title}" vs "${created.title}":`);  
              console.log(`  AI Similarity: ${aiSimilarity.toFixed(3)}`);
              console.log(`  Location Score: ${locationScore.toFixed(3)} ("${locA}" vs "${locB}")`);
              console.log(`  Word Overlap: ${overlap} words (${(Math.min(overlap, 5) * 0.05).toFixed(3)} points)`);
              console.log(`  Category Match: ${categoryMatch.toFixed(3)}`);
              console.log(`  Total Score: ${score.toFixed(3)}`);
            }
            
            return { cand, score, aiSimilarity, locationScore, overlap, categoryMatch };
          })
          .filter((s) => s.score >= 0.15) // Lowered threshold for notification
          .sort((a, b) => b.score - a.score)
          .slice(0, 5); // Top 5 matches

        const currentUser = await storage.getUser(userId);

        for (const { cand, score } of scored) {
          const notifyUserId = cand.userId;

          // Create in-app notification for the candidate's owner
          console.log(`[NOTIFICATION] Creating notification for user ${notifyUserId} about match with score ${score}`);
          await storage.createNotification({
            userId: notifyUserId,
            type: "match",
            title: "🎯 Potential Match Found!",
            message: `AI found a ${Math.round(score * 100)}% match for your ${cand.status} item "${cand.title}". New ${created.status} item: "${created.title}" at ${created.location}.`,
            itemId: created.id,
          } as any);
          console.log(`[NOTIFICATION] Successfully created notification for user ${notifyUserId}`);

          // Email notification to candidate's owner
          const targetUser = await storage.getUser(notifyUserId);
          const to = targetUser?.email;
          if (to) {
            const targetName = getUserDisplayName(targetUser);
            const subject = "FindersKeepers: AI Found a Potential Match!";
            const lines = [
              `Hi ${targetName},`,
              "",
              `Great news! Our AI system found a ${Math.round(score * 100)}% match for your ${cand.status} item.`,
              "",
              `Your Item: "${cand.title}"`,
              `Matched With: "${created.title}"`,
              "",
              "Match Details:",
              `- Category: ${created.category}`,
              `- Location: ${created.location}`,
              `- Date: ${new Date(created.date).toLocaleDateString()}`,
              `- Posted: ${new Date(created.createdAt || Date.now()).toLocaleString()}`,
              "",
              "Contact Information:",
              created.contactName ? `- Name: ${created.contactName}` : "",
              created.contactPhone ? `- Phone: ${created.contactPhone}` : "",
              created.contactEmail ? `- Email: ${created.contactEmail}` : "",
              currentUser?.email ? `- User Email: ${currentUser.email}` : "",
              "",
              "Visit FindersKeepers to view photos and connect with the poster.",
              "",
              "Good luck reuniting with your item!",
              "- The FindersKeepers Team",
            ].filter(Boolean);
            await sendEmail(to, subject, lines.join("\n"));
          }

          // BIDIRECTIONAL: Also notify the NEW poster about the match
          console.log(`[NOTIFICATION] Creating bidirectional notification for user ${userId} about their new post matching existing item`);
          await storage.createNotification({
            userId: userId,
            type: "match",
            title: "🎯 Your Post Matched an Existing Item!",
            message: `Your ${created.status} item "${created.title}" matched with a ${cand.status} item: "${cand.title}".`,
            itemId: cand.id,
          } as any);
          console.log(`[NOTIFICATION] Successfully created bidirectional notification for user ${userId}`);

          // Email to the new poster
          if (currentUser?.email) {
            const currentUserName = getUserDisplayName(currentUser);
            const subject = "FindersKeepers: Your Post Matched!";  
            const candOwner = await storage.getUser(cand.userId);
            const lines = [
              `Hi ${currentUserName},`,
              "",
              `Good news! Your ${created.status} item "${created.title}" matched with an existing ${cand.status} item.`,
              "",
              `Matched Item: "${cand.title}"`,
              `Location: ${cand.location}`,
              `Date: ${new Date(cand.date).toLocaleDateString()}`,
              "",
              "Contact Information:",
              cand.contactName ? `- Name: ${cand.contactName}` : "",
              cand.contactPhone ? `- Phone: ${cand.contactPhone}` : "",
              cand.contactEmail ? `- Email: ${cand.contactEmail}` : "",
              candOwner?.email ? `- User Email: ${candOwner.email}` : "",
              "",
              "Visit FindersKeepers to view details and connect.",
              "",
              "- The FindersKeepers Team",
            ].filter(Boolean);
            await sendEmail(currentUser.email, subject, lines.join("\n"));
          }
        }
      } catch (notifyErr) {
        console.error("post-create match/notify error", notifyErr);
      }

      res.status(201).json(created);
    } catch (error: any) {
      if (error?.issues) {
        return res.status(400).json({ message: "Invalid item", issues: error.issues });
      }
      console.error("Error creating item:", error);
      res.status(500).json({ message: "Failed to create item", error: String(error?.message || error) });
    }
  });

  // AI-powered matches for a given item
  app.get("/api/items/:id/matches", async (req, res) => {
    try {
      const { id } = req.params as { id: string };
      const item = await storage.getItem(id);
      if (!item) return res.status(404).json({ message: "Item not found" });

      const oppositeStatus = item.status === "lost" ? "found" : "lost";
      // Consider same category first to narrow down
      const candidates = await storage.getItems({ status: oppositeStatus, category: item.category });

      // Ensure we have an embedding for the source item (best-effort)
      let itemEmbedding = (item as any).embedding as number[] | undefined;
      if (!itemEmbedding) {
        try {
          itemEmbedding = await buildItemEmbedding({
            title: item.title,
            description: item.description,
            category: item.category,
            location: item.location,
            imageUrl: item.imageUrl || undefined,
          });
        } catch {}
      }

      const norm = (s?: string) => (s || "").toLowerCase();
      const words = (s?: string) => Array.from(new Set(norm(s).split(/[^a-z0-9]+/).filter(Boolean)));
      const itemWords = new Set([...words(item.title), ...words(item.description)]);

      const scored = candidates
        .filter((c) => c.id !== item.id)
        .map((c) => {
          const cEmbedding = (c as any).embedding as number[] | undefined;
          const sim = itemEmbedding && cEmbedding ? cosineSimilarity(itemEmbedding, cEmbedding) : 0;
          let overlap = 0;
          for (const w of words(c.title + " " + c.description)) {
            if (itemWords.has(w)) overlap++;
          }
          // Combine similarity and heuristic overlap
          const score = sim + Math.min(overlap, 5) * 0.05; // small boost for word overlap
          return { item: c, score, sim, overlap };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);

      // Apply a reasonable threshold to filter weak matches
      const threshold = 0.10; // Further lowered threshold for better matching
      const results = scored.filter((s) => s.score >= threshold).map(({ item, score, sim, overlap }) => ({
        ...item,
        _match: { score, similarity: sim, overlap },
      }));
      
      // Enhanced debug logging for matches endpoint
      console.log(`[MATCHES DEBUG] Item: "${item.title}" (${item.status}) in category "${item.category}"`);
      console.log(`[MATCHES DEBUG] Looking for ${oppositeStatus} items in category "${item.category}"`);
      console.log(`[MATCHES DEBUG] Found ${candidates.length} candidates`);
      console.log(`[MATCHES DEBUG] Scored candidates:`, scored.slice(0, 5).map(s => ({ 
        title: s.item.title, 
        score: s.score.toFixed(3), 
        sim: s.sim.toFixed(3), 
        overlap: s.overlap 
      })));
      console.log(`[MATCHES DEBUG] Final results: ${results.length} matches (threshold: ${threshold})`);

      res.json({ itemId: id, count: results.length, matches: results });
    } catch (err) {
      console.error("matches error", err);
      res.status(500).json({ message: "Failed to compute matches" });
    }
  });

  // Multer memory storage for file uploads (stores in memory, not disk)
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  });

  // Upload endpoint - stores image as Base64 in MongoDB
  app.post("/api/upload", upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    
    // Convert image to Base64 data URL
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const dataUrl = `data:${mimeType};base64,${base64Image}`;
    
    // Return the data URL to be stored in the item's imageUrl field
    res.json({ url: dataUrl });
  });

  // Notifications API
  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub as string;
      const list = await storage.getUserNotifications(userId);
      res.json(list);
    } catch (err) {
      console.error("Error fetching notifications", err);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Test endpoint to create sample found electronics items (for debugging)
  app.post("/api/test/create-sample-items", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log(`[TEST] Creating sample found electronics items for testing matches`);
      
      const sampleItems = [
        {
          title: "Found Wireless Earbuds",
          description: "Found black wireless earbuds near the library. They look like AirPods or similar brand.",
          category: "Electronics",
          location: "Library, Bengaluru",
          status: "found",
          contactName: "Test User",
          contactEmail: "test@example.com",
          contactPhone: "1234567890",
          userId: userId,
          date: new Date(),
        },
        {
          title: "Found Bluetooth Headphones",
          description: "Found blue bluetooth headphones in the cafeteria. Brand looks like Sony or similar.",
          category: "Electronics", 
          location: "Cafeteria, Bengaluru",
          status: "found",
          contactName: "Test User",
          contactEmail: "test@example.com", 
          contactPhone: "1234567890",
          userId: userId,
          date: new Date(),
        }
      ];

      const createdItems = [];
      for (const itemData of sampleItems) {
        // Build embedding for the sample item
        let embedding: number[] | undefined = undefined;
        try {
          embedding = await buildItemEmbedding({
            title: itemData.title,
            description: itemData.description,
            category: itemData.category,
            location: itemData.location,
          });
        } catch (error) {
          console.error(`[TEST] Failed to create embedding for sample item:`, error);
        }

        const created = await storage.createItem({
          ...itemData,
          embedding,
        } as any);
        createdItems.push(created);
      }
      
      console.log(`[TEST] Successfully created ${createdItems.length} sample items`);
      res.json({ success: true, items: createdItems });
    } catch (error) {
      console.error("[TEST] Error creating sample items:", error);
      res.status(500).json({ message: "Failed to create sample items", error: String(error) });
    }
  });

  // Test endpoint to create a notification (for debugging)
  app.post("/api/test/notification", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log(`[TEST] Creating test notification for user ${userId}`);
      
      const notification = await storage.createNotification({
        userId: userId,
        type: "test",
        title: "🧪 Test Notification",
        message: "This is a test notification to verify the system is working correctly.",
        itemId: undefined,
      } as any);
      
      console.log(`[TEST] Successfully created test notification:`, notification);
      res.json({ success: true, notification });
    } catch (error) {
      console.error("[TEST] Error creating test notification:", error);
      res.status(500).json({ message: "Failed to create test notification", error: String(error) });
    }
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
