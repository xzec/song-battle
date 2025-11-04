export const Layout = ({ children }: React.PropsWithChildren) => (
  <div className="h-[100vh] min-h-screen overflow-auto bg-linear-to-b from-violet-950 via-gray-900 to-gray-950 text-white">
    {children}
  </div>
)
