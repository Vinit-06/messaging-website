import React from 'react'
import { supabase } from '../lib/supabase'

const SupabaseStatus = () => {
  const isDemo = supabase.supabaseUrl.includes('demo-project') || 
                 supabase.supabaseUrl.includes('your-project') ||
                 supabase.supabaseAnonKey.includes('demo') ||
                 supabase.supabaseAnonKey.includes('your-')

  if (!isDemo) {
    return (
      <div className="glass p-4 rounded-lg border border-green-500/20 bg-green-50/10 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400 font-medium">Connected to Supabase</span>
        </div>
        <p className="text-sm text-gray-400 mt-1">Real-time messaging enabled</p>
      </div>
    )
  }

  return (
    <div className="glass p-4 rounded-lg border border-amber-500/20 bg-amber-50/10 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
            <span className="text-amber-400 font-medium">Demo Mode</span>
          </div>
          <p className="text-sm text-gray-400">Configure Supabase for full functionality</p>
        </div>
        <button
          onClick={() => window.open('/SUPABASE_SETUP.md', '_blank')}
          className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-sm transition-colors"
        >
          Setup Guide
        </button>
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        <p>• Create account at supabase.com</p>
        <p>• Replace environment variables</p>
        <p>• Execute database schema</p>
      </div>
    </div>
  )
}

export default SupabaseStatus
