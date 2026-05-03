import { createClient } from '@supabase/supabase-js'
const URL = 'https://axcibivfagterprfmhyh.supabase.co'
const API_KEY = 'sb_publishable_mtXLdtn9DDMxBsR9QrY4PA_dfzU9l2p'

export const supabase = createClient(URL, API_KEY)