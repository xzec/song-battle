import type { ReactNode } from 'react'

export const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 text-white">
    {children}
  </div>
)
