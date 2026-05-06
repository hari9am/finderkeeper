import { VercelRequest, VercelResponse } from '@vercel/node';
import path from 'path';
import fs from 'fs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { default: express } = await import('express');
    const app = express();

    app.use(express.json());

    // API routes - add all endpoints the frontend expects
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', message: 'FindersKeepers API is working' });
    });

    app.get('/api/items', (req, res) => {
      res.json([]);
    });

    app.get('/api/auth/user', (req, res) => {
      // Return 401 so frontend knows user is not logged in
      res.status(401).json({ message: 'Not authenticated' });
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
      res.status(401).json({ message: 'Not authenticated' });
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
