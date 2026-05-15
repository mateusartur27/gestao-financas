'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, ListChecks, LogOut, ChevronDown, KeyRound } from 'lucide-react'
import type { AppTab } from '@/types'
import ChangePasswordModal from './ChangePasswordModal'

const navItems: { tab: AppTab; label: string; icon: typeof LayoutDashboard }[] = [
  { tab: 'recebimentos', label: 'Recebimentos', icon: ListChecks },
  { tab: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
]

interface Props {
  currentTab: AppTab
  onTabChange: (tab: AppTab) => void
}

export default function Navbar({ currentTab, onTabChange }: Props) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null)
    })
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Brand */}
          <button onClick={() => onTabChange('recebimentos')} className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <span className="text-sm font-bold text-white">R$</span>
            </div>
            <span className="hidden text-sm font-semibold text-gray-900 sm:block">
              Gestão de Finanças
            </span>
          </button>

          {/* Tab nav */}
          <nav className="flex items-center gap-1">
            {navItems.map(({ tab, label, icon: Icon }) => {
              const active = currentTab === tab
              return (
                <button
                  key={tab}
                  onClick={() => onTabChange(tab)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    active
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:block">{label}</span>
                </button>
              )
            })}
          </nav>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100"
            >
              <span className="hidden sm:block max-w-[160px] truncate">
                {userEmail ?? '...'}
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`}
              />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl bg-white py-1 shadow-lg ring-1 ring-gray-100 animate-in fade-in slide-in-from-top-1 duration-150 z-50">
                <button
                  onClick={() => {
                    setShowMenu(false)
                    setShowPasswordModal(true)
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50"
                >
                  <KeyRound size={14} />
                  Alterar senha
                </button>
                <div className="my-1 border-t border-gray-100" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 transition hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut size={14} />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </>
  )
}
