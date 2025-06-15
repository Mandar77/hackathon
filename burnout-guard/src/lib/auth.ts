import { supabase } from './supabase'

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.message === 'Email not confirmed') {
        // If email is not confirmed, try to resend confirmation email
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email,
        })
        
        if (resendError) {
          throw new Error('Failed to resend confirmation email. Please try again later.')
        }
        
        throw new Error('Please check your email for the confirmation link. A new confirmation email has been sent.')
      }
      throw error
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error }
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error }
  }
} 