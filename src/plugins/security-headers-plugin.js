/**
 * Security Headers Plugin for Docusaurus
 *
 * Adds security headers to the DEV SERVER ONLY, via middleware. Production
 * headers are served by Vercel from vercel.json's `headers` array — keep the
 * CSP here in sync with that one so `pnpm start` mirrors production policy.
 */

module.exports = function securityHeadersPlugin(context, options) {
  return {
    name: 'security-headers-plugin',
    
    // For development server
    configureDevServer(app) {
      app.use((req, res, next) => {
        // Prevent clickjacking
        res.setHeader('X-Frame-Options', 'DENY');
        
        // Prevent MIME type sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        // Control referrer information
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        // Content Security Policy
        res.setHeader(
          'Content-Security-Policy',
          "default-src 'self'; script-src 'self' 'unsafe-inline' https://*.googletagmanager.com https://www.clarity.ms https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://fonts.googleapis.com; img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com https://*.clarity.ms https://github.com; font-src 'self' data: https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://fonts.gstatic.com; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.clarity.ms https://c.bing.com https://build.0g.ai; frame-src 'self' https://challenges.cloudflare.com https://www.youtube.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'"
        );
        
        // HTTPS enforcement
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        
        // Permissions policy
        res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        
        next();
      });
    },
  };
}; 