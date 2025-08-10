#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 ChatApp Supabase Setup Script\n');

// Check if .env exists
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), '.env.example');

function updateEnvFile(supabaseUrl, supabaseKey) {
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  } else if (fs.existsSync(envExamplePath)) {
    envContent = fs.readFileSync(envExamplePath, 'utf8');
  }
  
  // Replace or add Supabase variables
  envContent = envContent.replace(
    /VITE_SUPABASE_URL=.*/,
    `VITE_SUPABASE_URL=${supabaseUrl}`
  );
  envContent = envContent.replace(
    /VITE_SUPABASE_ANON_KEY=.*/,
    `VITE_SUPABASE_ANON_KEY=${supabaseKey}`
  );
  
  // If variables don't exist, add them
  if (!envContent.includes('VITE_SUPABASE_URL=')) {
    envContent += `\nVITE_SUPABASE_URL=${supabaseUrl}`;
  }
  if (!envContent.includes('VITE_SUPABASE_ANON_KEY=')) {
    envContent += `\nVITE_SUPABASE_ANON_KEY=${supabaseKey}`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Updated .env file with Supabase credentials');
}

// Check if running interactively
if (process.argv.length > 2) {
  const supabaseUrl = process.argv[2];
  const supabaseKey = process.argv[3];
  
  if (supabaseUrl && supabaseKey) {
    updateEnvFile(supabaseUrl, supabaseKey);
    console.log('\n🎉 Setup complete! Restart your dev server to see changes.');
    process.exit(0);
  }
}

console.log('To set up Supabase configuration:');
console.log('1. Create a new project at https://supabase.com');
console.log('2. Go to Project Settings → API');
console.log('3. Copy your Project URL and anon public key');
console.log('4. Run this script with your credentials:');
console.log('   node setup-supabase.js "https://your-project.supabase.co" "your-anon-key"');
console.log('\n📚 For detailed setup instructions, see SUPABASE_SETUP.md');
console.log('📋 Execute supabase-schema.sql in your Supabase SQL Editor');
