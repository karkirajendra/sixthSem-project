// Analytics tracking utility for frontend
class AnalyticsTracker {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.sessionStartTime = Date.now();
    this.pageViews = [];
    this.isTracking = true;

    // Track page visibility for session duration
    this.setupVisibilityTracking();
    this.setupBeforeUnloadTracking();
  }

  getOrCreateSessionId() {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  setupVisibilityTracking() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackSessionDuration();
      }
    });
  }

  setupBeforeUnloadTracking() {
    window.addEventListener('beforeunload', () => {
      this.trackSessionDuration();
    });
  }

  async trackEvent(eventType, data = {}) {
    if (!this.isTracking) return;

    try {
      const eventData = {
        type: eventType,
        sessionId: this.sessionId,
        device: this.detectDevice(),
        location: await this.getLocation(),
        page: {
          url: window.location.pathname,
          title: document.title,
          referrer: document.referrer,
        },
        metadata: {
          timestamp: Date.now(),
          ...data,
        },
      };

      // Add session ID to headers for backend correlation
      const headers = {
        'Content-Type': 'application/json',
        'X-Session-Id': this.sessionId,
      };

      await fetch('/api/admin/analytics/track', {
        method: 'POST',
        headers,
        body: JSON.stringify(eventData),
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  trackPageView(pageTitle = document.title) {
    const pageView = {
      url: window.location.pathname,
      title: pageTitle,
      timestamp: Date.now(),
    };

    this.pageViews.push(pageView);
    this.trackEvent('page_view', pageView);
  }

  trackPropertyView(propertyId, propertyData = {}) {
    this.trackEvent('property_view', {
      propertyId,
      ...propertyData,
    });
  }

  trackSessionDuration() {
    const duration = Math.floor((Date.now() - this.sessionStartTime) / 1000);

    // Only track sessions longer than 10 seconds
    if (duration > 10) {
      navigator.sendBeacon(
        '/api/admin/analytics/track',
        JSON.stringify({
          type: 'user_session',
          sessionId: this.sessionId,
          metadata: { duration },
        })
      );
    }
  }

  detectDevice() {
    const userAgent = navigator.userAgent;

    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }

    if (
      /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
        userAgent
      )
    ) {
      return 'mobile';
    }

    return 'desktop';
  }

  async getLocation() {
    try {
      // Try to get location from browser geolocation API
      if (navigator.geolocation) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                coordinates: {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                },
              });
            },
            () => {
              // Fallback to IP-based location (will be handled by backend)
              resolve({});
            },
            { timeout: 5000 }
          );
        });
      }
    } catch (error) {
      console.warn('Geolocation failed:', error);
    }

    return {};
  }

  // Custom event tracking
  trackCustomEvent(eventName, data = {}) {
    this.trackEvent('custom_event', {
      eventName,
      ...data,
    });
  }

  // Search tracking
  trackSearch(query, filters = {}, results = 0) {
    this.trackEvent('search', {
      searchQuery: query,
      filters,
      resultCount: results,
    });
  }

  // Filter tracking
  trackFilter(filterType, filterValue) {
    this.trackEvent('filter_applied', {
      filterType,
      filterValue,
    });
  }

  // Form tracking
  trackFormSubmit(formName, formData = {}) {
    this.trackEvent('form_submit', {
      formName,
      ...formData,
    });
  }

  // Error tracking
  trackError(errorType, errorMessage, context = {}) {
    this.trackEvent('error', {
      errorType,
      errorMessage,
      context,
    });
  }

  // Disable tracking (for privacy compliance)
  disableTracking() {
    this.isTracking = false;
    sessionStorage.removeItem('analytics_session_id');
  }

  // Enable tracking
  enableTracking() {
    this.isTracking = true;
    this.sessionId = this.getOrCreateSessionId();
  }
}

// Create global instance
const analytics = new AnalyticsTracker();

// Auto-track page views on route changes
let currentPath = window.location.pathname;
const observer = new MutationObserver(() => {
  if (window.location.pathname !== currentPath) {
    currentPath = window.location.pathname;
    analytics.trackPageView();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Track initial page view
document.addEventListener('DOMContentLoaded', () => {
  analytics.trackPageView();
});

export default analytics;
