/**
 * Fetches the duration of an audio file from a URL
 * @param {string} url - The URL of the audio file
 * @returns {Promise<number>} - Duration in seconds
 */
export const getAudioDuration = (url) => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    
    const handleLoadedMetadata = () => {
      // Check if duration is valid (not Infinity or NaN)
      if (isFinite(audio.duration) && audio.duration > 0) {
        resolve(Math.round(audio.duration));
      } else {
        // If duration is still not available, try loading more data
        audio.load();
      }
    };

    const handleCanPlayThrough = () => {
      // This fires when enough data has been loaded
      if (isFinite(audio.duration) && audio.duration > 0) {
        cleanup();
        resolve(Math.round(audio.duration));
      }
    };

    const handleDurationChange = () => {
      // This fires when duration changes from Infinity to actual value
      if (isFinite(audio.duration) && audio.duration > 0) {
        cleanup();
        resolve(Math.round(audio.duration));
      }
    };
    
    const handleError = (error) => {
      cleanup();
      reject(new Error(`Failed to load audio: ${error.message || 'Unknown error'}`));
    };

    const cleanup = () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('error', handleError);
      audio.src = '';
    };

    // Add timeout to prevent hanging
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Timeout: Could not load audio duration'));
    }, 10000); // 10 second timeout

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('error', handleError);
    
    // Set preload to metadata to load enough data
    audio.preload = 'metadata';
    audio.src = url;
    
    // Clear timeout when promise resolves
    const originalResolve = resolve;
    resolve = (value) => {
      clearTimeout(timeout);
      originalResolve(value);
    };
  });
};
