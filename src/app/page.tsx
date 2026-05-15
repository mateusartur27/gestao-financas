'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import RecebimentosView from '@/components/RecebimentosView'
import DashboardView from '@/components/DashboardView'
import type { AppTab } from '@/types'

import ChangePasswordModal from '@/components/ChangePasswordModal'

const TAB_KEY = 'app-tab'

export default function App() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [tab, setTab] = useState<AppTab>('recebimentos')
  const [showRecoveryModal, setShowRecoveryModal] = useState(false)

  useEffect(() => {
    // Restore last active tab
    try {
      const saved = sessionStorage.getItem(TAB_KEY)
      if (saved === 'dashboard' || saved === 'recebimentos') setTab(saved)
    } catch { /* ignore */ }

    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      // If we don't have a session, but there's a recovery hash, wait for it to be processed
      if (!data.session && !window.location.hash.includes('access_token')) {
        router.replace('/login')
      } else if (data.session) {
        setChecking(false)
      }
    })
    
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowRecoveryModal(true)
      }
      if (event === 'SIGNED_OUT') {
        router.replace('/login')
      } else if (session) {
        setChecking(false)
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [router])

  const handleTabChange = (next: AppTab) => {
    setTab(next)
    try { sessionStorage.setItem(TAB_KEY, next) } catch { /* ignore */ }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentTab={tab} onTabChange={handleTabChange} />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {tab === 'recebimentos' ? <RecebimentosView /> : <DashboardView />}
      </main>
      
      {showRecoveryModal && (
        <ChangePasswordModal onClose={() => setShowRecoveryModal(false)} />
      )}
    </div>
  )
}

