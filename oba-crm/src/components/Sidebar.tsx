'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, BookCheck, XCircle, Calendar, ArrowRightLeft, AlertTriangle } from 'lucide-react'

const navItems = [
  { href: '/',              label: 'Painel',          icon: LayoutDashboard },
  { href: '/criancas',      label: 'Lista de Espera', icon: Users },
  { href: '/monitoria',     label: 'Monitoria',       icon: ArrowRightLeft },
  { href: '/concluidas',    label: 'Concluídas',      icon: BookCheck },
  { href: '/desligadas',    label: 'Desligadas',      icon: XCircle },
  { href: '/agendamentos',  label: 'Agendamentos',    icon: Calendar },
  { href: '/alertas',       label: 'Alertas',         icon: AlertTriangle },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm" style={{fontFamily:'var(--font-display)'}}>O</span>
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-none" style={{fontFamily:'var(--font-display)'}}>OBA</div>
            <div className="text-white/40 text-xs mt-0.5">Avaliações Psicológicas</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all
                ${active
                  ? 'bg-brand-600 text-white font-medium'
                  : 'text-white/55 hover:text-white/90 hover:bg-white/8'}`}>
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <div className="text-white/30 text-xs">v1.0 · 2026</div>
      </div>
    </aside>
  )
}
