// ⚠️ SOLO PARA DESARROLLO ⚠️
// Este archivo expone SERVICE_ROLE en el frontend.
// NO LO USES EN PRODUCCIÓN. Cámbialo por Edge Functions o backend.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mjfuiimdiwhzvbnanquu.supabase.co';

// anon/public (frontend normal)
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qZnVpaW1kaXdoenZibmFucXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NTE2OTQsImV4cCI6MjA1ODQyNzY5NH0.PGWk10r1zLXDY3A00kYy7N0gD7lI3abL4S55McKJROg';

// service_role (la que me pasaste) — SOLO DEV
const SUPABASE_SERVICE_ROLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qZnVpaW1kaXdoenZibmFucXV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mjg1MTY5NCwiZXhwIjoyMDU4NDI3Njk0fQ.dHE84mCaRHCaNT8brOIB0c_eN_Rw_saUxltUz2FbxGw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Cliente "admin" para DEV (omite RLS, usa Admin API)
export const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});
