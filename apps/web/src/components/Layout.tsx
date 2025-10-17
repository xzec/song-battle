import type { ReactNode } from 'react'

export const Layout = ({ children }: { children: ReactNode }) => (
  <div className="h-[100vh] min-h-screen overflow-auto bg-linear-to-b from-emerald-950 via-gray-900 to-gray-950 text-white">
    {children}
  </div>
)
