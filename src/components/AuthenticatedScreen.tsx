type AuthenticatedScreenProps = {
  userName: string
  onLogout: () => void
}
export const AuthenticatedScreen = ({
  userName,
  onLogout,
}: AuthenticatedScreenProps) => (
  <div className="min-h-screen">
    <header className="flex items-center justify-between px-8 py-6">
      <div>
        <p className="text-sm text-white/50 uppercase tracking-[0.3em]">
          Song Battle
        </p>
        <h2 className="mt-2 font-semibold text-2xl text-white">
          Welcome, {userName}
        </h2>
      </div>
      <button
        onClick={onLogout}
        className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/80 transition hover:border-white/40 hover:text-white"
      >
        Log out
      </button>
    </header>
    <main className="px-8 pb-16">
      <div className="mt-12 max-w-2xl rounded-3xl border border-white/10 bg-slate-950/60 p-8 backdrop-blur-xl">
        <h3 className="font-semibold text-2xl text-white">
          Tournament bracket coming next
        </h3>
        <p className="mt-3 text-white/70">
          You are authenticated with Spotify. Next step is to let you pick
          playlists or tracks to seed the bracket. Sit tight while we finish
          wiring the battle experience.
        </p>
      </div>
    </main>
  </div>
)
