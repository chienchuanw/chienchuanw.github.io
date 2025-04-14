/**
 * Estimates the reading time of a text in minutes
 * @param text The text to estimate reading time for
 * @param wordsPerMinute Average reading speed (default: 200 words per minute)
 * @returns Reading time in minutes (rounded up to nearest minute)
 */
export function calculateReadingTime(text: string, wordsPerMinute = 200): string {
  // Remove markdown syntax
  const cleanText = text
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]*`/g, '') // Remove inline code
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Replace links with just their text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // Remove images
    .replace(/(\*|_){1,3}([^*_]*)(\*|_){1,3}/g, '$2') // Remove bold/italic markers
    .replace(/#+\s+(.*)/g, '$1') // Remove heading markers
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .trim();

  // Count words
  const words = cleanText.split(/\s+/).length;
  
  // Calculate reading time
  const minutes = Math.ceil(words / wordsPerMinute);
  
  return `${minutes} min`;
}