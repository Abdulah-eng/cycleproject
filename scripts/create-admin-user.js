require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  const email = 'admin@bikemax.com'
  const password = 'admin123'

  console.log('🔐 Creating admin user...')
  console.log('Email:', email)
  console.log('Password:', password)
  console.log('')

  try {
    // Check if user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error('❌ Error checking existing users:', listError.message)
      throw listError
    }

    const existingUser = existingUsers.users.find(u => u.email === email)

    if (existingUser) {
      console.log('ℹ️  User already exists!')
      console.log('User ID:', existingUser.id)
      console.log('Email:', existingUser.email)
      console.log('Created at:', existingUser.created_at)
      console.log('')
      console.log('✓ You can login with:')
      console.log('  Email:', email)
      console.log('  Password:', password)
      return
    }

    // Create new user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'admin'
      }
    })

    if (error) {
      console.error('❌ Error creating user:', error.message)
      throw error
    }

    console.log('✅ Admin user created successfully!')
    console.log('User ID:', data.user.id)
    console.log('Email:', data.user.email)
    console.log('')
    console.log('✓ You can now login with:')
    console.log('  Email:', email)
    console.log('  Password:', password)
    console.log('')
    console.log('🌐 Login at: http://localhost:3002/admin/login')

  } catch (error) {
    console.error('❌ Failed to create admin user:', error.message)
    process.exit(1)
  }
}

createAdminUser()
