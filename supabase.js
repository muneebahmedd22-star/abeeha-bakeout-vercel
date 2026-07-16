// Initialize Supabase Client globally for Vanilla JS
const supabaseUrl = 'https://jqzpgwrvzkhhgneihxcq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxenBnd3J2emtoaGduZWloeGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxOTE1MTEsImV4cCI6MjA5OTc2NzUxMX0.nchAaN8GF9Z-Xil9we0WluXJEdpSQCiMVCDQRJ0mHNI';

if (window.supabase) {
  window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
  console.log("Supabase Client initialized successfully.");
} else {
  console.error("Supabase CDN script not loaded. Check internet connection.");
}
