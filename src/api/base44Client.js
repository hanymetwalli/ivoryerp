/**
 * Base44 Client - Wrapper for Ivory Client
 * This file redirects all base44 calls to the local PHP API
 */

import ivoryClient, { base44 } from './ivoryClient.js';

// Re-export everything
export { base44, ivoryClient };
export default ivoryClient;
