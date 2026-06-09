import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('delivery_locations').select('*').limit(1);
  console.log('delivery_locations:', data, error);
  const { data: d2, error: e2 } = await supabase.from('campaigns').select('*').limit(1);
  console.log('campaigns:', d2, e2);
  const { data: d3, error: e3 } = await supabase.from('participants').select('*').limit(1);
  console.log('participants:', d3, e3);
}
check();
