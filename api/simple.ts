import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('Simple endpoint called');
    
    // Set environment variable for Vercel
    process.env.VERCEL = 'true';
    
    // Test basic Express import
    console.log('Testing Express import...');
    const express = await import('express');
    console.log('Express imported successfully');
    
    // Test importing the built app
    console.log('Testing app import...');
    const appModule = await import('../dist/index.js');
    console.log('App module imported:', typeof appModule);
    
    const app = appModule.default || appModule;
    console.log('App extracted:', typeof app);
    
    // If we get here, try to use the app
    if (typeof app === 'function') {
      console.log('Calling Express app...');
      return app(req, res);
    } else {
      throw new Error('App is not a function');
    }
    
  } catch (error) {
    console.error('Simple endpoint error:', error);
    res.status(500).json({
      error: 'Simple endpoint failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
}
