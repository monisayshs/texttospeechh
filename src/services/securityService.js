/**
 * Security Service for Input Sanitization, Rate Limiting, and Path Traversal Prevention
 */
class SecurityService {
  constructor() {
    this.rateLimitMap = new Map(); // IP -> { count, resetTime }
    this.maxRequestsPerMinute = 40;
    this.maxFileSizeBytes = 10 * 1024 * 1024; // 10 MB limit

    // Periodic cleanup of rate limit table every 5 minutes
    setInterval(() => this.cleanupRateLimits(), 5 * 60 * 1000);
  }

  /**
   * Sanitize raw input text string against XSS & script injection
   */
  sanitizeText(text) {
    if (!text || typeof text !== 'string') return '';
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .trim();
  }

  /**
   * Sanitize file path against path traversal attacks
   */
  sanitizeFilename(filename) {
    if (!filename || typeof filename !== 'string') return 'document.txt';
    return filename.replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/\.\.+/g, '.');
  }

  /**
   * Enforce rate limiting per client IP
   */
  checkRateLimit(clientIp) {
    const ip = clientIp || '127.0.0.1';
    const now = Date.now();
    const windowMs = 60 * 1000;

    let record = this.rateLimitMap.get(ip);
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      this.rateLimitMap.set(ip, record);
      return { allowed: true, remaining: this.maxRequestsPerMinute - 1 };
    }

    if (record.count >= this.maxRequestsPerMinute) {
      return { allowed: false, remaining: 0, resetTime: record.resetTime };
    }

    record.count++;
    return { allowed: true, remaining: this.maxRequestsPerMinute - record.count };
  }

  /**
   * Validate uploaded file size
   */
  validateFileSize(sizeInBytes) {
    if (sizeInBytes > this.maxFileSizeBytes) {
      throw new Error(`File size exceeds 10MB limit (Uploaded size: ${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB)`);
    }
    return true;
  }

  cleanupRateLimits() {
    const now = Date.now();
    for (const [ip, record] of this.rateLimitMap.entries()) {
      if (now > record.resetTime) {
        this.rateLimitMap.delete(ip);
      }
    }
  }
}

module.exports = new SecurityService();
