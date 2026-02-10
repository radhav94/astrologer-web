/**
 * Link Preview Utilities
 * Handles URL detection, validation, and preview data extraction
 */

/**
 * Detects URLs in text messages
 * @param {string} text - Message text to scan for URLs
 * @returns {string|null} - First detected URL or null
 */
export const detectURL = (text) => {
  if (!text || typeof text !== 'string') return null;
  
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  
  return matches ? matches[0] : null;
};

/**
 * Checks if URL points to an image
 * @param {string} url - URL to check
 * @returns {boolean} - True if URL is an image
 */
export const isImageURL = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  const imageExtensions = [
    '.jpg', '.jpeg', '.png', '.gif', 
    '.webp', '.bmp', '.svg', '.ico'
  ];
  
  const urlLower = url.toLowerCase();
  return imageExtensions.some(ext => urlLower.includes(ext));
};

/**
 * Extracts domain name from URL
 * @param {string} url - Full URL
 * @returns {string} - Domain name or original URL if parsing fails
 */
export const extractDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (error) {
    console.warn('Failed to parse URL:', error);
    return url;
  }
};

/**
 * Fetches Open Graph metadata for link preview
 * Note: Requires backend proxy to avoid CORS issues
 * @param {string} url - URL to fetch metadata from
 * @returns {Promise<Object>} - Preview data object
 */
export const fetchLinkPreview = async (url) => {
  // Placeholder for future implementation
  // This would typically call a backend endpoint that fetches OG metadata
  try {
    // Example structure for future implementation:
    // const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
    // const data = await response.json();
    
    return {
      url,
      title: null,
      description: null,
      image: null,
      domain: extractDomain(url),
    };
  } catch (error) {
    console.error('Failed to fetch link preview:', error);
    return null;
  }
};

/**
 * Validates if URL is accessible and safe
 * @param {string} url - URL to validate
 * @returns {boolean} - True if URL is valid
 */
export const isValidURL = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};
