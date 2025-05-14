/**
 * NASA FIRMS API Integration
 * Express.js API endpoint for Eye on the Fire
 * 
 * This script creates endpoints that securely proxy requests to NASA FIRMS API
 * without exposing your API key to the client side.
 */

const express = require('express');
const axios = require('axios');
const csv = require('csv-parser');
const { Readable } = require('stream');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Create Express server
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Security middleware - adjust if you're using helmet
const securityHeaders = (req, res, next) => {
  // Set CSP header
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' https://*.googleapis.com https://*.cloudflare.com https://unpkg.com https://www.googletagmanager.com https://code.jquery.com https://cdn.jsdelivr.net https://static.cloudflareinsights.com https://challenges.cloudflare.com 'unsafe-inline'; " +
    "style-src 'self' https://*.googleapis.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net 'unsafe-inline'; " +
    "img-src 'self' https://*.googleapis.com https://*.gstatic.com data:; " +
    "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
    "connect-src 'self' https://eyeonthefire.com https://*.googleapis.com https://www.googletagmanager.com https://analytics.google.com https://www.google-analytics.com https://challenges.cloudflare.com; " +
    "frame-src 'self' https://challenges.cloudflare.com;"
  );
  next();
};

// Apply security headers
app.use(securityHeaders);

// NASA FIRMS API configuration
const NASA_FIRMS_API_KEY = process.env.NASA_FIRMS_API_KEY || 'YOUR_NASA_FIRMS_API_KEY';
const NASA_FIRMS_BASE_URL = 'https://firms.modaps.eosdis.nasa.gov/api';

// Status endpoint to verify API connectivity
app.get('/api/nasa/firms/status', async (req, res) => {
  try {
    // Verify Cloudflare Turnstile token if provided
    if (req.query['cf-turnstile-token']) {
      const turnstileVerified = await verifyTurnstileToken(
        req.query['cf-turnstile-token'],
        req.ip
      );
      
      if (!turnstileVerified) {
        return res.status(403).json({ 
          error: 'Security verification failed' 
        });
      }
    }
    
    // Return success without making actual API call
    res.json({
      status: 'online',
      source: 'NASA FIRMS API',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ 
      error: 'Failed to check API status',
      message: error.message
    });
  }
});

// Main endpoint for fire data
app.get('/api/nasa/firms', async (req, res) => {
  try {
    // Extract query parameters
    const {
      source = 'MODIS_NRT',
      days = '1',
      area,
      north,
      south,
      east,
      west,
    } = req.query;
    
    // Verify Cloudflare Turnstile token if provided
    if (req.query['cf-turnstile-token']) {
      const turnstileVerified = await verifyTurnstileToken(
        req.query['cf-turnstile-token'],
        req.ip
      );
      
      if (!turnstileVerified) {
        return res.status(403).json({ 
          error: 'Security verification failed' 
        });
      }
    }
    
    // Determine the area to query
    let queryArea;
    
    if (area === 'usa') {
      // Use USA Continental bounds
      queryArea = 'usa_contiguous';
    } else if (north && south && east && west) {
      // Use custom bounds
      queryArea = `${west},${south},${east},${north}`;
    } else {
      // Default to USA Continental
      queryArea = 'usa_contiguous';
    }
    
    // Build NASA FIRMS URL
    const apiUrl = `${NASA_FIRMS_BASE_URL}/area/csv/${NASA_FIRMS_API_KEY}/${queryArea}/${source}/${days}`;
    
    // Make request to NASA FIRMS API
    const response = await axios.get(apiUrl, {
      responseType: 'text',
      timeout: 10000 // 10 second timeout
    });
    
    // Parse CSV data
    const fireData = await parseCSVData(response.data);
    
    // Apply any additional filtering here if needed
    
    // Return the JSON data
    res.json(fireData);
  } catch (error) {
    console.error('NASA FIRMS API error:', error);
    
    // Handle different error types
    if (error.response) {
      // NASA API responded with an error
      const status = error.response.status;
      res.status(status).json({
        error: `NASA FIRMS API error (${status})`,
        message: error.response.data
      });
    } else if (error.request) {
      // No response received
      res.status(504).json({
        error: 'NASA FIRMS API timeout',
        message: 'No response received from NASA API'
      });
    } else {
      // Generic error
      res.status(500).json({
        error: 'NASA FIRMS API error',
        message: error.message
      });
    }
  }
});

/**
 * Parse CSV data to JSON
 * @param {string} csvData - CSV data string
 * @returns {Promise<Array>} - Array of parsed objects
 */
function parseCSVData(csvData) {
  return new Promise((resolve, reject) => {
    const results = [];
    const readable = new Readable();
    readable._read = () => {}; // Required but not used
    readable.push(csvData);
    readable.push(null);
    
    readable.pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

/**
 * Verify Cloudflare Turnstile token
 * @param {string} token - Turnstile token
 * @param {string} ip - Client IP address
 * @returns {Promise<boolean>} - Whether token is valid
 */
async function verifyTurnstileToken(token, ip) {
  // If no secret key is configured, skip verification
  if (!process.env.TURNSTILE_SECRET_KEY) {
    console.warn('Turnstile secret key not configured, skipping verification');
    return true;
  }
  
  try {
    const formData = new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: ip
    });
    
    const result = await axios.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    return result.data.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

// For any route not found, return the main index.html (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`NASA FIRMS API key: ${NASA_FIRMS_API_KEY ? 'Configured' : 'MISSING'}`);
  console.log(`Turnstile key: ${process.env.TURNSTILE_SECRET_KEY ? 'Configured' : 'Not configured'}`);
});
