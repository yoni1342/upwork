// supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jzhcvqytdvhmdhfkktno.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6aGN2cXl0ZHZobWRoZmtrdG5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMTUxMTIsImV4cCI6MjA2NTU5MTExMn0.qjsyiaa_V7p-3M6md1jCz1LMzDLQFTTzB4CFSsYIXiQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
