import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 font-sans antialiased">
      <div className="flex w-full max-w-[600px] flex-col items-center gap-6 rounded-3xl border border-white/10 bg-white/5 p-12 text-center shadow-2xl backdrop-blur-md">
        <h1 className="text-8xl font-black text-cyan-400">404</h1>

        <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-100">
          Neural Node Not Found
        </h2>

        <p className="text-sm text-slate-400">
          The structural anchor you requested does not exist in the current vector space.
        </p>

        <Link
          href="/"
          className="mt-4 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/10 transition-transform active:scale-95"
        >
          Return to ProJob Hub
        </Link>
      </div>
    </div>
  );
}
