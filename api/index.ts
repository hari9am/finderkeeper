import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // For now, return a simple response to avoid Rollup dependency issues
    res.status(200).json({ 
      status: 'ok', 
      message: 'FindersKeepers API is running - deployment test successful',
      timestamp: new Date().toISOString(),
      note: 'Full Express app temporarily disabled due to Vercel build issues'
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
