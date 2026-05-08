import dotenv from 'dotenv';
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { log } from "./utils";
import { connectToMongoDB } from "./mongodb";

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Promise that resolves once MongoDB + routes + static serving are all ready.
// Vercel's api/index.ts must await this before handling any request.
let _resolveReady!: () => void;
export const appReady: Promise<void> = new Promise<void>((resolve) => {
  _resolveReady = resolve;
});

(async () => {
  console.log('🚀 Server starting...');
  // Connect to MongoDB
  console.log('🔌 Connecting to MongoDB...');
  await connectToMongoDB();
  console.log('✅ MongoDB connected');

  console.log('🛣️ Registering routes...');
  const server = await registerRoutes(app);
  console.log('✅ Routes registered');

  // Ensure unmatched API routes return JSON 404 instead of falling through to HTML
  app.use("/api/*", (_req, res) => {
    res.status(404).json({ message: "Not Found" });
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    // Serve static files in production (including Vercel serverless)
    const { serveStatic } = await import("./vite");
    serveStatic(app);
  }

  // Signal that the app is fully initialized
  _resolveReady();

  // Skip server.listen() in Vercel serverless environment
  if (!process.env.VERCEL) {
    const port = parseInt(process.env.PORT || '5000', 10);
    const host = process.env.LOCAL_ONLY === 'false' ? '0.0.0.0' : '127.0.0.1';
    server.listen({
      port,
      host,
      reusePort: process.platform !== 'win32',
    }, () => {
      log(`serving on ${host}:${port}`);
    });
  }
})();

// Export for Vercel serverless functions
export default app;
