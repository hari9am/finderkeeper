import { VercelRequest, VercelResponse } from '@vercel/node';

let cachedApp: any = null;

async function getApp() {
  if (!cachedApp) {
    // Use require to avoid TypeScript declaration issues
    const app = require('../dist/index.js');
    cachedApp = app.default || app;
  }
  return cachedApp;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Import the Express app
    const app = await getApp();
    
    // Handle the request with the Express app
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    
    // Return a proper error response
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
}
