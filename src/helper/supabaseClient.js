import { createClient } from "@supabase/supabase-js"

const supabaseurl = "https://aijlfwseguonlbidloul.supabase.co";
const supabaseanonkey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpamxmd3NlZ3VvbmxiaWRsb3VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNTgwMDgsImV4cCI6MjA3MjkzNDAwOH0.2XFuGM5yZG7d5IkPOwv_vlgCFkGkMrPfTmVT_8P97hE";

const supabase = createClient(supabaseurl, supabaseanonkey);

export default supabase;

