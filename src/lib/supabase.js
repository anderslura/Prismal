import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hqgjcqvnmwixmscxlakk.supabase.co'
const supabaseKey = 'sb_publishable_AA5ijeJXvpCgAAXbga_OOA_Frhn8LvV'

export const supabase = createClient(supabaseUrl, supabaseKey)
