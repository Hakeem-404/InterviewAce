import { useEffect, useRef } from 'react';

export const useAutoSave = <T>(
  data: T,
  key: string,
  interval: number = 30000,
  enabled: boolean = true
) => {
  const lastSavedRef = useRef<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const save = () => {
      const serializedData = JSON.stringify(data);
      
      // Only save if data has changed
      if (serializedData !== lastSavedRef.current) {
        try {
          localStorage.setItem(key, serializedData);
          lastSavedRef.current = serializedData;
          console.log(`Auto-saved data to ${key}`);
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    };

    // Save immediately if data exists
    if (data) {
      save();
    }

    // Set up interval for periodic saves
    intervalRef.current = setInterval(save, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [data, key, interval, enabled]);

  // Manual save function
  const saveNow = () => {
    if (data) {
      try {
        const serializedData = JSON.stringify(data);
        localStorage.setItem(key, serializedData);
        lastSavedRef.current = serializedData;
        return true;
      } catch (error) {
        console.error('Manual save failed:', error);
        return false;
      }
    }
    return false;
  };

  // Load function
  const load = (): T | null => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Load failed:', error);
      return null;
    }
  };

  return { saveNow, load };
};