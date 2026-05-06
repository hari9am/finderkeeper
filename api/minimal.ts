import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Create a minimal Express app directly
    const { default: express } = await import('express');
    const app = express();
    
    // Basic middleware
    app.use(express.json());
    
    // Health check route
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', message: 'Minimal Express app working' });
    });
    
    // Items route
    app.get('/api/items', (req, res) => {
      res.json({ items: [], message: 'Items endpoint working' });
    });
    
    // Catch all route
    app.use('*', (req, res) => {
      res.json({ 
        message: 'FindersKeepers API is working!',
        method: req.method,
        path: req.path,
        timestamp: new Date().toISOString()
      });
    });
    
    // Handle the request
    return app(req, res);
    
  } catch (error) {
    console.error('Minimal endpoint error:', error);
    res.status(500).json({
      error: 'Minimal endpoint failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
