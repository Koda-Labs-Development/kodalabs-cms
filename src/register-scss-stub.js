/**
 * Register a require hook to stub out SCSS imports
 * This prevents Node from trying to load .scss files when Payload loads admin components
 */

// Stub out SCSS/CSS requires - they're already compiled in the build folder
require.extensions['.scss'] = () => {};
require.extensions['.css'] = () => {};
require.extensions['.sass'] = () => {};
