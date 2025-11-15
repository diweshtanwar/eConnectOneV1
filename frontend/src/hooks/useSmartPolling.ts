import { useEffect, useState, useCallback } from 'react';

interface SmartPollingOptions {
  activeInterval?: number;
  inactiveInterval?: number;
  inactivityTimeout?: number;
}

export const useSmartPolling = (
  callback: () => void,
  options: SmartPollingOptions = {}
) => {
  const {
    activeInterval = 30000,      // 30 seconds when active
    inactiveInterval = 120000,   // 2 minutes when inactive
    inactivityTimeout = 60000,   // 1 minute to consider inactive
  } = options;

  const [isActive, setIsActive] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
    setIsActive(true);
  }, []);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [updateActivity]);

  useEffect(() => {
    const checkActivity = () => {
      const now = Date.now();
      if (now - lastActivity > inactivityTimeout) {
        setIsActive(false);
      }
    };

    const activityInterval = setInterval(checkActivity, 10000); // Check every 10 seconds
    return () => clearInterval(activityInterval);
  }, [lastActivity, inactivityTimeout]);

  useEffect(() => {
    const interval = isActive ? activeInterval : inactiveInterval;
    const pollingInterval = setInterval(callback, interval);
    
    return () => clearInterval(pollingInterval);
  }, [callback, isActive, activeInterval, inactiveInterval]);

  return { isActive };
};