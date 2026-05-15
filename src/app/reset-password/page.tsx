'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, KeyRound, Loader2, Check, ArrowLeft } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    
    // Function to confirm we have the right context to reset password
    const checkContext = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      // If we already have a session, we're good
      if (session) {
        setChecking(false)
        return
      }

      // If no session, wait for onAuthStateChange to process the hash/code
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY' || session) {
          setChecking(false)
          subscription.unsubscribe()
        }
      })

      // Security timeout: if no session/recovery found in 5 seconds, it's likely an invalid access
      const timeout = setTimeout(() => {
        subscription.unsubscribe()
        // If we still have no session after 5s, redirect to login
        supabase.auth.getSession().then(({ data }) => {
          if (!data.session) router.replace('/login')
          else setChecking(false)
        })
      }, 5000)

      return () => {
        clearTimeout(timeout)
        subscription.unsubscribe()
      }
    }

    checkContext()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 6) {
      setError('A senha deve ter ao menos 6 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      // Logout to force login with new password
      await supabase.auth.signOut()
      
      setTimeout(() => {
        router.replace('/login')
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar senha')
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Validando link de recuperação...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-white p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 shadow-lg">
            <KeyRound className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Nova Senha</h1>
          <p className="mt-1 text-sm text-gray-500">Crie uma nova senha para sua conta AHUB</p>
        </div>

        {success ? (
          <div className="card text-center space-y-4 py-8 shadow-xl border-green-100">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Check size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Senha Alterada!</h3>
              <p className="text-sm text-gray-500 mt-2 px-6">
                Sua senha foi atualizada em todos os apps AHUB. Use as novas credenciais para entrar.
              </p>
            </div>
            <div className="pt-4 px-6">
              <button onClick={() => router.replace('/login')} className="btn-primary w-full">
                Ir para o Login
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-5 shadow-xl border-gray-100">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Digite sua nova senha</label>
              <div className="relative">
                <input
                  className="input pr-10 focus:ring-2 focus:ring-brand-500"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600 transition-colors"
                  onClick={() => setShowPassword(v => !v)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Confirme a nova senha</label>
              <input
                className="input focus:ring-2 focus:ring-brand-500"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary w-full h-11" disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              {loading ? 'Processando...' : 'Atualizar Minha Senha'}
            </button>

            <button 
              type="button"
              onClick={() => router.replace('/login')}
              className="flex w-full items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors pt-2"
            >
              <ArrowLeft size={16} />
              Cancelar e voltar
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
