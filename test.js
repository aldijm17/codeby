const { createClient } = require('@supabase/supabase-js');
const URL = 'https://fcsnrultgjyffddeebid.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjc25ydWx0Z2p5ZmZkZGVlYmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNDgwODcsImV4cCI6MjA4MDcyNDA4N30.Ja2IfnmYYOL6RR-M3QIDtisEdpzpyZ55gMOZ0dK78Ig';
const supabase = createClient(URL, KEY);
supabase.from('profiles').select('*').limit(1).then(res => {
  require('fs').writeFileSync('d:/codeby/test.json', JSON.stringify(res, null, 2));
  console.log("Written!");
});
