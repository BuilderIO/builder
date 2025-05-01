// Safe version that works in both client and server
export const BUILDER_API_KEY = '3abba43a11524bf289a58c742805ce9c'

// Server-only code that won't be included in client bundles
if (typeof process !== 'undefined' && process.env.NODE_ENV) {
  // This code only runs in true Node.js environments
  try {
    // Use dynamic import() with require() for truly server-only code
    // This pattern prevents bundlers from trying to analyze the module
    const initServerOnly = () => {
      try {
        // Using Function constructor prevents static analysis
        const dynamicRequire = new Function('module', 'return require(module)')
        if (dynamicRequire('isolated-vm')) {
          const { initializeNodeRuntime } = dynamicRequire('@builder.io/sdk-react/node/init')
          initializeNodeRuntime()
          console.log('Builder.io Node runtime initialized successfully')
        }
      } catch (e) {
        console.log('Builder.io Node runtime initialization skipped (normal in dev/client)')
      }
    }
    
    // Only run in true Node environment, not in browser or during bundle
    if (typeof window === 'undefined' && typeof require === 'function') {
      initServerOnly()
    }
  } catch (err) {
    // Safely ignore - this means we're not in a Node.js environment
  }
} 