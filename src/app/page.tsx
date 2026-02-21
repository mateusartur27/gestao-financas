'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import RecebimentosView from '@/components/RecebimentosView'
import DashboardView from '@/components/DashboardView'
import type { AppTab } from '@/types'

export default function App() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [tab, setTab] = useState<AppTab>('recebimentos')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/login')
      else setChecking(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.replace('/login')
    })
    return () => listener.subscription.unsubscribe()
  }, [router])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentTab={tab} onTabChange={setTab} />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {tab === 'recebimentos' ? <RecebimentosView /> : <DashboardView />}
      </main>
    </div>
  )
}
