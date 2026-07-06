export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 font-sans antialiased">
      <div className="flex w-full max-w-[400px] flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-xl backdrop-blur-md">
        <div className="size-8 animate-spin rounded-full border-y-2 border-cyan-400"></div>
        <h2 className="font-heading text-lg font-bold text-slate-100">
          Loading Workspace
        </h2>
        <p className="text-sm text-slate-400">
          Initializing ProJob environment...
        </p>
      </div>
    </div>
  );
}
