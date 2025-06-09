
import { useState, useEffect } from 'react';

type SetValue<T> = (value: T | ((val: T) => T)) => void;

// WARNING: This hook is not currently used for user authentication data after Firebase integration.
// Firebase handles its own session persistence.
// This hook is still used for application data like transactions and budgets.

function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue: SetValue<T> = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsedItem = JSON.parse(item);
        if (JSON.stringify(storedValue) !== JSON.stringify(parsedItem)) {
          setStoredValue(parsedItem);
        }
      } else {
        // Item does NOT exist in localStorage for this key.
        // Ensure React state reflects initialValue and initialize localStorage.
        if (JSON.stringify(storedValue) !== JSON.stringify(initialValue)) {
           setStoredValue(initialValue);
        }
        window.localStorage.setItem(key, JSON.stringify(initialValue));
      }
    } catch (error) {
      console.error(`Error synchronizing localStorage key "${key}":`, error);
      // If error occurs, reset to initialValue to prevent app crash with corrupted data
      setStoredValue(initialValue); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, initialValue]); // Only re-run if key or initialValue definition changes


  return [storedValue, setValue];
}

export default useLocalStorage;
