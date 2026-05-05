import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Import the Express app
    const { default: app } = await import('../dist/index.js');
    
    // Handle the request with the Express app
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    
    // Return a proper error response
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
