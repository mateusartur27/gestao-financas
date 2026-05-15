'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, KeyRound, Loader2, Check } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [checkingHash, setCheckingHash] = useState(true)

  useEffect(() => {
    // Wait for supabase to parse the hash
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setCheckingHash(false)
      if (!data.session && !window.location.hash.includes('access_token')) {
        // If there's no session and no hash, they shouldn't be here
        router.replace('/login')
      }
    })
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
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      router.replace('/login')
    }, 2500)
  }

  if (checkingHash) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
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
          <div className="card text-center space-y-4 py-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Check size={24} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Senha alterada!</h3>
              <p className="text-sm text-gray-500 mt-1">
                Você será redirecionado para o login.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Nova senha</label>
              <div className="relative">
                <input
                  className="input pr-10"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(v => !v)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Confirmar senha</label>
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {loading ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
