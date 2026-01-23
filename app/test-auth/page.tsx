'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestAuth() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      // Test 1: Check if Supabase client is initialized
      console.log('Supabase client:', supabase)

      // Test 2: Try to get session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      console.log('Session:', sessionData, sessionError)

      // Test 3: Try to sign in
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'admin@bikemax.com',
        password: 'admin123',
      })
      console.log('Login result:', loginData, loginError)

      setResult({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        session: sessionData,
        sessionError: sessionError?.message,
        login: loginData,
        loginError: loginError?.message,
      })
    } catch (err: any) {
      console.error('Test error:', err)
      setResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Supabase Auth Test</h1>

        <button
          onClick={testConnection}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Authentication'}
        </button>

        {result && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Results:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="font-bold mb-2">Test Credentials:</h3>
          <p>Email: admin@bikemax.com</p>
          <p>Password: admin123</p>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>Check the browser console for detailed logs.</p>
        </div>
      </div>
    </div>
  )
}
