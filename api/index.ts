import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Import the Express app with Rollup dependencies excluded
    const { default: app } = await import('../dist/index.js');
    
    // Handle the request with the Express app
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    
    // Check if it's the Rollup dependency error
    if (error instanceof Error && error.message.includes('Cannot find module @rollup')) {
      // Return a helpful error message
      return res.status(500).json({
        error: 'Build Configuration Error',
        message: 'The application is still using Rollup dependencies. Please rebuild the application.',
        solution: 'Run: npm run build:vercel && vercel --prod'
      });
    }
    
    // Return a proper error response for other errors
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
