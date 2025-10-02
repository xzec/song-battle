export const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
      <p className="text-sm text-white/80">Connecting …</p>
    </div>
  </div>
)
