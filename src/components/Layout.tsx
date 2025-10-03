import type { ReactNode } from 'react'

export const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-gray-900 to-gray-950 text-white">
    {children}
  </div>
)
