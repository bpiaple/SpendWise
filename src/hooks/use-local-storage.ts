import { useState, useEffect } from 'react';

type SetValue<T> = (value: T | ((val: T) => T)) => void;

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
    // This effect ensures that the state is updated on the client-side
    // after initial hydration if the localStorage value differs from initialValue.
    if (typeof window !== 'undefined') {
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                const parsedItem = JSON.parse(item);
                if (JSON.stringify(storedValue) !== JSON.stringify(parsedItem)) {
                    setStoredValue(parsedItem);
                }
            } else if (JSON.stringify(storedValue) !== JSON.stringify(initialValue) && !item) {
                 window.localStorage.setItem(key, JSON.stringify(initialValue));
                 setStoredValue(initialValue);
            }
        } catch (error) {
            console.error(`Error synchronizing localStorage key "${key}":`, error);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, initialValue]); // Add storedValue to dependency array if you want re-sync on its change, but it might cause loops. Initial setup should be fine with just key, initialValue.


  return [storedValue, setValue];
}

export default useLocalStorage;
