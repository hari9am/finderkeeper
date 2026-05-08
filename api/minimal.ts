import { VercelRequest, VercelResponse } from '@vercel/node';
import path from 'path';
import fs from 'fs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { default: express } = await import('express');
    const app = express();

    app.use(express.json());

    // Parse cookies manually for Vercel serverless
    app.use((req: any, res, next) => {
      req.cookies = {};
      const cookieHeader = req.headers.cookie;
      if (cookieHeader) {
        cookieHeader.split(';').forEach((cookie: string) => {
          const [name, ...rest] = cookie.trim().split('=');
          if (name) req.cookies[name] = rest.join('=') || '';
        });
      }
      next();
    });

    // Request logging middleware
    app.use((req: any, res, next) => {
      console.log(`[REQUEST] ${req.method} ${req.url} | cookies: ${Object.keys(req.cookies || {}).join(',')}`);
      next();
    });

    // Simple test route
    app.get('/api/test', (req, res) => {
      res.json({ message: 'Test route works', path: req.path });
    });

    // Debug cookies endpoint
    app.get('/api/debug/cookies', (req, res) => {
      const user = getUserFromSession(req);
      res.json({
        hasCookieHeader: !!req.headers.cookie,
        cookieHeader: req.headers.cookie || 'none',
        userFromSession: user,
        timestamp: new Date().toISOString()
      });
    });

    // API routes - add all endpoints the frontend expects
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', message: 'FindersKeepers API is working' });
    });

    app.get('/api/items', (req, res) => {
      res.json([]);
    });

    // Store items in memory (minimal mode - no MongoDB)
    const itemsStore: any[] = [];
    let itemIdCounter = 1;

    // Image upload - parse multipart form-data and return data URL
    app.post('/api/upload', async (req, res) => {
      try {
        // Simple multipart parser
        const contentType = req.headers['content-type'] || '';
        if (!contentType.includes('multipart/form-data')) {
          return res.status(400).json({ message: 'Expected multipart/form-data' });
        }

        const boundary = contentType.split('boundary=')[1]?.replace(/"/g, '');
        if (!boundary) {
          return res.status(400).json({ message: 'Missing boundary' });
        }

        // Collect raw body
        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        await new Promise<void>((resolve, reject) => {
          req.on('end', resolve);
          req.on('error', reject);
        });

        const body = Buffer.concat(chunks);
        const boundaryBuffer = Buffer.from(`--${boundary}`);
        const parts: Buffer[] = [];
        let start = 0;
        while (true) {
          const idx = body.indexOf(boundaryBuffer, start);
          if (idx === -1) break;
          if (parts.length > 0) {
            const part = body.slice(start, idx - 2); // -2 for \r\n before boundary
            if (part.length > 0) parts.push(part);
          }
          start = idx + boundaryBuffer.length;
        }

        // Find the file part
        let fileBuffer: Buffer | null = null;
        let mimeType = 'image/png';
        for (const part of parts) {
          const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
          if (headerEnd === -1) continue;
          const header = part.slice(0, headerEnd).toString('utf8');
          if (header.includes('filename=') || header.includes('Content-Type: image/')) {
            fileBuffer = part.slice(headerEnd + 4); // +4 for \r\n\r\n
            const ctMatch = header.match(/Content-Type:\s*([^\r\n]+)/i);
            if (ctMatch) mimeType = ctMatch[1].trim();
            break;
          }
        }

        if (!fileBuffer || fileBuffer.length === 0) {
          return res.status(400).json({ message: 'No file found in upload' });
        }

        const base64 = fileBuffer.toString('base64');
        const dataUrl = `data:${mimeType};base64,${base64}`;
        res.json({ url: dataUrl });
      } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Upload failed' });
      }
    });

    // Create item
    app.post('/api/items', (req, res) => {
      try {
        const body = req.body;
        const user = getUserFromSession(req);
        const newItem = {
          id: String(itemIdCounter++),
          ...body,
          userId: user?.id || 'anonymous',
          createdAt: new Date().toISOString(),
        };
        itemsStore.push(newItem);
        res.status(201).json(newItem);
      } catch (error) {
        res.status(500).json({ message: 'Failed to create item' });
      }
    });

    // Helper to get user from session cookie
    function getUserFromSession(req: any) {
      try {
        const sessionToken = req.cookies?.session;
        if (!sessionToken) return null;
        const sessionData = JSON.parse(Buffer.from(sessionToken, 'base64').toString('utf8'));
        return sessionData;
      } catch {
        return null;
      }
    }

    app.get('/api/auth/user', (req, res) => {
      const user = getUserFromSession(req);
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      res.json({ id: user.id, email: user.email, name: user.name, picture: user.picture });
    });

    app.get('/api/user/items', (req, res) => {
      res.json([]);
    });

    app.get('/api/user/notifications', (req, res) => {
      res.json([]);
    });

    app.get('/api/user/notifications/count', (req, res) => {
      res.json({ count: 0 });
    });

    app.get('/api/user', (req, res) => {
      const user = getUserFromSession(req);
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      res.json({ id: user.id, email: user.email, name: user.name, picture: user.picture });
    });

    app.get('/api/login/google', (req, res) => {
      try {
        const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
        console.log('GOOGLE_CLIENT_ID present:', !!clientId);
        if (!clientId) {
          return res.status(503).json({ message: 'Google OAuth not configured' });
        }
        const origin = (process.env.PUBLIC_ORIGIN || 'https://findit-ten.vercel.app').trim();
        const redirectUri = `${origin}/api/callback/google`;
        const scope = encodeURIComponent('openid email profile');
        const state = Math.random().toString(36).substring(2);
        
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}&prompt=select_account`;
        
        return res.redirect(googleAuthUrl);
      } catch (error) {
        console.error('Google login error:', error);
        return res.status(500).json({ message: 'Login failed', error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    app.get('/api/callback/google', async (req, res) => {
      try {
        const code = req.query.code as string;
        const error = req.query.error as string;
        
        if (error) {
          console.error('Google OAuth error:', error);
          return res.redirect('/?error=oauth_denied');
        }
        
        if (!code) {
          return res.redirect('/?error=no_code');
        }
        
        const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
        const origin = (process.env.PUBLIC_ORIGIN || 'https://findit-ten.vercel.app').trim();
        const redirectUri = `${origin}/api/callback/google`;
        
        if (!clientId || !clientSecret) {
          return res.redirect('/?error=oauth_not_configured');
        }
        
        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
          })
        });
        
        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error('Token exchange failed:', errorText);
          return res.redirect('/?error=token_exchange_failed');
        }
        
        const tokenData = await tokenResponse.json();
        
        // Get user info from Google
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
        });
        
        if (!userResponse.ok) {
          console.error('Failed to get user info');
          return res.redirect('/?error=user_info_failed');
        }
        
        const userData = await userResponse.json();
        
        // Create a simple session token (JWT-like)
        const sessionData = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          picture: userData.picture,
          iat: Date.now()
        };
        
        // Set session cookie - SameSite=None required for cross-site OAuth redirect
        const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64');
        res.setHeader('Set-Cookie', `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=604800`);
        
        // Redirect back to app
        res.redirect('/');
        
      } catch (error) {
        console.error('OAuth callback error:', error);
        res.redirect('/?error=callback_error');
      }
    });

    app.get('/api/logout', (req, res) => {
      res.setHeader('Set-Cookie', 'session=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0');
      res.redirect('/');
    });

    // Serve static React app
    const distPath = path.resolve(process.cwd(), 'dist', 'public');
    console.log('Serving static files from:', distPath);

    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));

      // SPA fallback - serve index.html for non-API routes
      app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) {
          return res.status(404).json({ message: 'API endpoint not found' });
        }
        const indexPath = path.resolve(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(404).json({ message: 'index.html not found' });
        }
      });
    } else {
      app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) {
          return res.status(404).json({ message: 'API endpoint not found' });
        }
        res.status(500).send(`
          <html>
            <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
              <h1>FindersKeepers</h1>
              <p style="color: red;">Static files not found at: ${distPath}</p>
              <p>The frontend build may be missing.</p>
            </body>
          </html>
        `);
      });
    }

    return app(req, res);

  } catch (error) {
    console.error('Minimal endpoint error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
