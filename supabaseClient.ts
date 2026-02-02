
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rvcwuavtufabscutmwua.supabase.co';
const supabaseAnonKey = 'sb_publishable_2jelwVbTLjGZYhsiiP8-0w_RwC69cqS';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
