
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
    // This effect is responsible for updating the React state (storedValue)
    // if the 'key' or 'initialValue' props change, or if localStorage
    // was empty for the key and needs to be initialized.
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        // Item exists in localStorage. Ensure our React state matches.
        const parsedItem = JSON.parse(item);
        if (JSON.stringify(storedValue) !== JSON.stringify(parsedItem)) {
          setStoredValue(parsedItem);
        }
      } else {
        // Item does NOT exist in localStorage for this key.
        // 1. The React state should be `initialValue`.
        // 2. localStorage should be set to `initialValue`.
        if (JSON.stringify(storedValue) !== JSON.stringify(initialValue)) {
          setStoredValue(initialValue);
        }
        // Always ensure localStorage is initialized if it was missing for this key.
        window.localStorage.setItem(key, JSON.stringify(initialValue));
      }
    } catch (error) {
      console.error(`Error synchronizing localStorage key "${key}":`, error);
    }
    // This effect should ONLY re-run if the key or initialValue itself changes.
    // Do NOT add storedValue to this dependency array, as that would cause a loop
    // because this effect can call setStoredValue.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, initialValue]);


  return [storedValue, setValue];
}

export default useLocalStorage;
