import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Simple health check response
    if (req.method === 'GET' && req.url === '/') {
      return res.status(200).json({
        message: 'FindersKeepers API is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    }

    // For now, return a simple response for all routes
    return res.status(200).json({
      message: 'API endpoint working',
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
