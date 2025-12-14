import { UAParser } from 'ua-parser-js';
import Analytics from '../models/Analytics.js';

// Device detection helper
const detectDevice = (userAgent) => {
  const parser = new UAParser(userAgent);
  const deviceType = parser.getDevice().type;

  if (deviceType === 'mobile') return 'mobile';
  if (deviceType === 'tablet') return 'tablet';
  return 'desktop';
};

// Get location from IP (mock implementation - you'd use a real IP geolocation service)
const getLocationFromIP = (ip) => {
  // Mock location data based on common Nepali IPs
  const mockLocations = [
    { city: 'Kathmandu', region: 'Bagmati', country: 'Nepal' },
    { city: 'Pokhara', region: 'Gandaki', country: 'Nepal' },
    { city: 'Lalitpur', region: 'Bagmati', country: 'Nepal' },
    { city: 'Bhaktapur', region: 'Bagmati', country: 'Nepal' },
    { city: 'Biratnagar', region: 'Koshi', country: 'Nepal' },
  ];

  return mockLocations[Math.floor(Math.random() * mockLocations.length)];
};

// Analytics tracking middleware
export const trackPageView = async (req, res, next) => {
  try {
    const sessionId =
      req.headers['x-session-id'] || `session_${Date.now()}_${Math.random()}`;
    const userAgent = req.get('User-Agent');
    const ip = req.ip || req.connection.remoteAddress;
    const device = detectDevice(userAgent);
    const location = getLocationFromIP(ip);

    // Extract browser and OS info
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser().name;
    const os = parser.getOS().name;

    const analyticsData = {
      type: 'page_view',
      sessionId,
      userId: req.user?.id || null,
      ipAddress: ip,
      userAgent,
      device,
      browser,
      os,
      location,
      page: {
        url: req.originalUrl,
        title: req.headers['x-page-title'] || 'Unknown',
        referrer: req.get('Referer') || '',
      },
    };

    // Save analytics data asynchronously (don't wait for it)
    Analytics.create(analyticsData).catch((err) => {
      console.error('Analytics tracking error:', err);
    });

    next();
  } catch (error) {
    console.error('Analytics middleware error:', error);
    next(); // Continue even if analytics fails
  }
};

// Track user sessions
export const trackUserSession = async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'];
    const duration = req.headers['x-session-duration'];

    if (sessionId && duration) {
      const userAgent = req.get('User-Agent');
      const ip = req.ip || req.connection.remoteAddress;
      const device = detectDevice(userAgent);
      const location = getLocationFromIP(ip);

      const sessionData = {
        type: 'user_session',
        sessionId,
        userId: req.user?.id || null,
        ipAddress: ip,
        userAgent,
        device,
        location,
        metadata: {
          duration: parseInt(duration) || 0,
        },
      };

      Analytics.create(sessionData).catch((err) => {
        console.error('Session tracking error:', err);
      });
    }

    next();
  } catch (error) {
    console.error('Session tracking middleware error:', error);
    next();
  }
};

// Track property views
export const trackPropertyView = async (propertyId, req) => {
  try {
    const sessionId =
      req.headers['x-session-id'] || `session_${Date.now()}_${Math.random()}`;
    const userAgent = req.get('User-Agent');
    const ip = req.ip || req.connection.remoteAddress;
    const device = detectDevice(userAgent);
    const location = getLocationFromIP(ip);

    const viewData = {
      type: 'property_view',
      sessionId,
      userId: req.user?.id || null,
      propertyId,
      ipAddress: ip,
      userAgent,
      device,
      location,
      page: {
        url: req.originalUrl,
        referrer: req.get('Referer') || '',
      },
    };

    await Analytics.create(viewData);
  } catch (error) {
    console.error('Property view tracking error:', error);
  }
};

