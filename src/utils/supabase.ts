
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../integrations/supabase/types';

// Initialize the Supabase client with hardcoded values
const supabaseUrl = "https://mdffqqajcyoubnukufpk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZmZxcWFqY3lvdWJudWt1ZnBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMDI3NzAsImV4cCI6MjA1OTg3ODc3MH0.eXFkxybCPP_RFkWY_3M1rP9dO7D11qr9_TRnGJRL_KE";

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Supabase tables
export const TABLES = {
  PRODUCTS: 'products',
  CUSTOMERS: 'customers',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  CATEGORIES: 'categories',
  PAYMENT_METHODS: 'payment_methods',
  STORES: 'stores',
  SETTINGS: 'settings',
  PRINTERS: 'printers',
  USERS: 'users'
};
