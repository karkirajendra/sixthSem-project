import { useEffect, useRef } from 'react';
import analytics from '../utils/analytics';

// Hook for tracking page views
export const usePageView = (pageName) => {
  useEffect(() => {
    analytics.trackPageView(pageName);
  }, [pageName]);
};

// Hook for tracking property views
export const usePropertyView = (propertyId, propertyData) => {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (propertyId && !hasTracked.current) {
      analytics.trackPropertyView(propertyId, propertyData);
      hasTracked.current = true;
    }
  }, [propertyId, propertyData]);
};

// Hook for tracking search
export const useSearchTracking = () => {
  return {
    trackSearch: (query, filters, results) => {
      analytics.trackSearch(query, filters, results);
    },
  };
};

// Hook for tracking form submissions
export const useFormTracking = () => {
  return {
    trackFormSubmit: (formName, formData) => {
      analytics.trackFormSubmit(formName, formData);
    },
  };
};

// Hook for tracking custom events
export const useEventTracking = () => {
  return {
    trackEvent: (eventName, data) => {
      analytics.trackCustomEvent(eventName, data);
    },
    trackFilter: (filterType, filterValue) => {
      analytics.trackFilter(filterType, filterValue);
    },
    trackError: (errorType, errorMessage, context) => {
      analytics.trackError(errorType, errorMessage, context);
    },
  };
};

// Hook for analytics control
export const useAnalyticsControl = () => {
  return {
    enableTracking: () => analytics.enableTracking(),
    disableTracking: () => analytics.disableTracking(),
    isTracking: analytics.isTracking,
  };
};

export default analytics;
