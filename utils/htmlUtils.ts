/**
 * Utility functions for handling HTML content
 */

/**
 * Strip HTML tags from a string and decode HTML entities
 */
export const stripHtml = (html: string): string => {
  if (!html) return '';
  
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, '');
  
  // Decode common HTML entities
  const htmlEntities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&hellip;': '...',
    '&mdash;': '—',
    '&ndash;': '–',
    '&lsquo;': '\'',
    '&rsquo;': '\'',
    '&ldquo;': '"',
    '&rdquo;': '"',
  };
  
  // Replace HTML entities
  Object.keys(htmlEntities).forEach(entity => {
    const regex = new RegExp(entity, 'g');
    text = text.replace(regex, htmlEntities[entity]);
  });
  
  // Handle numeric HTML entities (e.g., &#8217;)
  text = text.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(dec);
  });
  
  // Handle hex HTML entities (e.g., &#x2019;)
  text = text.replace(/&#x([0-9a-f]+);/gi, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  
  // Clean up extra whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
};

/**
 * Convert HTML line breaks to actual line breaks
 */
export const convertHtmlLineBreaks = (html: string): string => {
  if (!html) return '';
  
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '');
};

/**
 * Clean HTML content for display in React Native Text component
 */
export const cleanHtmlForText = (html: string): string => {
  if (!html) return '';
  
  // First convert line breaks
  let text = convertHtmlLineBreaks(html);
  
  // Then strip remaining HTML
  text = stripHtml(text);
  
  // Clean up multiple line breaks
  text = text.replace(/\n{3,}/g, '\n\n');
  
  return text.trim();
};

/**
 * Extract plain text from HTML while preserving basic formatting
 */
export const htmlToPlainText = (html: string): string => {
  if (!html) return '';
  
  let text = html;
  
  // Convert common HTML elements to plain text equivalents
  text = text.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n$1\n');
  text = text.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '$1');
  text = text.replace(/<b[^>]*>(.*?)<\/b>/gi, '$1');
  text = text.replace(/<em[^>]*>(.*?)<\/em>/gi, '$1');
  text = text.replace(/<i[^>]*>(.*?)<\/i>/gi, '$1');
  text = text.replace(/<u[^>]*>(.*?)<\/u>/gi, '$1');
  text = text.replace(/<ul[^>]*>(.*?)<\/ul>/gi, '$1\n');
  text = text.replace(/<ol[^>]*>(.*?)<\/ol>/gi, '$1\n');
  text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n');
  
  // Remove remaining HTML tags
  text = stripHtml(text);
  
  // Clean up whitespace
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.replace(/^\s+|\s+$/g, '');
  
  return text;
};
