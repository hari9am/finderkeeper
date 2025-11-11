// Replit Auth integration - blueprint:javascript_log_in_with_replit
import { Issuer, Strategy, type TokenSet, type Client } from "openid-client";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import MongoDBStore from "connect-mongodb-session";
import { storage } from "./mongoStorage";

const getIssuer = memoize(
  async () => {
    const issuerUrl = process.env.ISSUER_URL ?? "https://replit.com/oidc";
    return await Issuer.discover(issuerUrl);
  },
  { maxAge: 3600 * 1000 }
);

// Share OIDC clients across handlers by domain
const clientsByDomain = new Map<string, Client>();

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const MongoStore = MongoDBStore(session);
  const sessionStore = new MongoStore(
    {
      uri: process.env.MONGODB_URI!,
      databaseName: 'findit',
      collection: 'sessions',
      expires: sessionTtl,
    }
  );
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // Use secure cookies only in production; in local HTTP dev, secure cookies won't be sent
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  });
}

// Extract name from email (e.g., "harry.potter@gmail.com" -> "Harry")
function extractNameFromEmail(email?: string): string | undefined {
  if (!email) return undefined;
  const localPart = email.split('@')[0];
  // Remove numbers and special chars, split by dots/underscores
  const namePart = localPart.replace(/[0-9]/g, '').split(/[._-]/)[0];
  if (!namePart) return undefined;
  // Capitalize first letter
  return namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();
}

function updateUserSession(user: any, tokens: TokenSet, claims: any) {
  user.claims = claims;
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  // Prefer tokens.expires_at if present
  user.expires_at = tokens.expires_at ?? claims?.exp;
}

async function upsertUser(claims: any) {
  const extractedName = extractNameFromEmail(claims["email"]);
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"] || extractedName,
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  let issuer: Awaited<ReturnType<typeof getIssuer>>;
  try {
    issuer = await getIssuer();
  } catch (err) {
    // If OIDC discovery fails (e.g., local dev without REPL_ID/REPL_SECRET)
    if (process.env.ALLOW_DEV_AUTH === "true") {
      // Lightweight dev login that seeds a mock user and sets a session
      app.get("/api/login", async (req: any, res) => {
        const devUser = {
          claims: { sub: "dev-user", email: "dev@example.com", first_name: "Dev", last_name: "User" },
          expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
        } as any;
        try {
          await storage.upsertUser({ id: "dev-user", email: "dev@example.com", firstName: "Dev", lastName: "User" });
        } catch {}
        req.login(devUser, (e: any) => {
          if (e) return res.status(500).json({ message: "Dev login failed" });
          res.redirect("/");
        });
      });
      app.get("/api/callback", (_req, res) => res.redirect("/"));
      app.get("/api/logout", (req, res) => {
        req.logout(() => res.redirect("/"));
      });
      return;
    } else {
      // Strict mode: keep endpoints but indicate misconfiguration
      app.get("/api/login", (_req, res) =>
        res.status(503).json({ message: "Auth not configured. Set REPL_ID/REPL_SECRET and ensure ISSUER_URL is reachable." })
      );
      app.get("/api/callback", (_req, res) =>
        res.status(503).json({ message: "Auth not configured. Set REPL_ID/REPL_SECRET and ensure ISSUER_URL is reachable." })
      );
      app.get("/api/logout", (_req, res) => res.redirect("/"));
      return;
    }
  }

  const verify = async (
    tokens: TokenSet,
    userinfo: any,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {} as any;
    updateUserSession(user, tokens, userinfo);
    await upsertUser(userinfo);
    verified(null, user);
  };

  const registeredStrategies = new Set<string>();

  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const client = new issuer.Client({
        client_id: process.env.REPL_ID!,
        client_secret: process.env.REPL_SECRET,
        redirect_uris: [`https://${domain}/api/callback`],
        response_types: ["code"],
      });

      const strategy = new Strategy(
        {
          client,
          params: {
            scope: "openid email profile offline_access",
          },
        },
        verify
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
      clientsByDomain.set(domain, client);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      const client = clientsByDomain.get(req.hostname);
      if (!client) {
        return res.redirect("/");
      }
      const url = client.endSessionUrl({
        post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
      });
      res.redirect(url);
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const issuer = await getIssuer();
    let client = clientsByDomain.get(req.hostname);
    if (!client) {
      client = new issuer.Client({
        client_id: process.env.REPL_ID!,
        client_secret: process.env.REPL_SECRET,
        redirect_uris: [`${req.protocol}://${req.hostname}/api/callback`],
        response_types: ["code"],
      });
      clientsByDomain.set(req.hostname, client);
    }
    const tokenResponse = await client.refresh(refreshToken);
    updateUserSession(user, tokenResponse, user.claims);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
