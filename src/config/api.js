/**
 * Customer Portal API Configuration
 * 
 * IMPORTANT: Replace 'your-exact-tenant' with your actual tenant ID
 * Get your tenant ID from: https://source-database-809785351172.europe-north1.run.app/api/profile/me
 * 
 * Tenant values are case-sensitive and must match exactly!
 * 
 * You can set these via environment variables:
 * - VITE_API_BASE_URL (optional, defaults to customer portal URL)
 * - VITE_TENANT_ID (optional, can override tenant value)
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://source-database-809785351172.europe-north1.run.app';
const TENANT = import.meta.env.VITE_TENANT_ID || 'peranrestaurante';

export default {
  baseURL: BASE_URL,
  tenant: TENANT
};

