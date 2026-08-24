import {CreateClient} from '@supabase/supabase-js';

const supabaseUrl = 'https://twbcniulnnsevkbymxmv.supabase.co';
const supabaseAnonKey = 'sb_publishable_hVwkvHFTRIARludwoE_ZHw_t6MtP85U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);