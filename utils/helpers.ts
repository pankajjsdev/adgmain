// utils/helpers.ts

/**
 * A simple helper function to format a date.
 * You might want to replace this with a dedicated date library like date-fns or Moment.js
 */
export const formatDate = (date: Date, format: string = 'YYYY-MM-DD'): string => {
  // Basic implementation (consider a library for full functionality)
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  let formatted = format;
  formatted = formatted.replace('YYYY', year.toString());
  formatted = formatted.replace('MM', month);
  formatted = formatted.replace('DD', day);
  
  return formatted;
};

/**
 * A helper function to debounce a function call.
 */
export const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout> | null;
  return (...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

// Add more general utility functions as needed
