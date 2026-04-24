// supabase.js
// This file creates the connection to our Supabase database
// Every route file imports this to read/write data

const { createClient } = require("@supabase/supabase-js"); // Calls createClient function from Supabase library this creates the database connection 

// Load environment variables from .env file into memory
require("dotenv").config();

// Create the Supabase client using our credentials from .env
const supabase = createClient(
  process.env.SUPABASE_URL,        // the database URL
  process.env.SUPABASE_SECRET_KEY  // the secret key for full admin access
);

module.exports = supabase;