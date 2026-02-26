export default function Loader({ message = "LOADING" }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center theme-panel text-slate-200 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <span className="absolute left-1/4 top-1/3 h-2.5 w-2.5 rounded-full bg-sky-400/20 blur-[1px]" />
        <span className="absolute left-1/3 top-2/3 h-3.5 w-3.5 rounded-full bg-sky-400/15 blur-[2px]" />
        <span className="absolute right-1/4 top-1/4 h-2 w-2 rounded-full bg-sky-400/20 blur-[1px]" />
        <span className="absolute right-1/3 top-2/3 h-2.5 w-2.5 rounded-full bg-sky-400/15 blur-[2px]" />
      </div>

      <div className="relative flex flex-col items-center justify-center">
        <div className="relative h-44 w-44">
          <svg
            viewBox="0 0 160 160"
            className="absolute inset-0 h-full w-full animate-spin"
          >
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle
              cx="80"
              cy="80"
              r="60"
              fill="none"
              stroke="rgba(56,189,248,0.18)"
              strokeWidth="8"
              strokeDasharray="34 14"
            />
            <circle
              cx="80"
              cy="80"
              r="60"
              fill="none"
              stroke="rgba(56,189,248,0.8)"
              strokeWidth="8"
              strokeDasharray="34 70"
              filter="url(#glow)"
            />
          </svg>

          <svg
            viewBox="0 0 160 160"
            className="absolute inset-[20px] h-[calc(100%-40px)] w-[calc(100%-40px)] animate-[spin_5s_linear_infinite]"
          >
            <circle
              cx="80"
              cy="80"
              r="44"
              fill="none"
              stroke="rgba(56,189,248,0.65)"
              strokeWidth="7"
              strokeDasharray="26 14"
            />
          </svg>

          <svg
            viewBox="0 0 160 160"
            className="absolute inset-[44px] h-[calc(100%-88px)] w-[calc(100%-88px)] animate-[spin_7s_linear_infinite_reverse]"
          >
            <circle
              cx="80"
              cy="80"
              r="26"
              fill="none"
              stroke="rgba(56,189,248,0.55)"
              strokeWidth="6"
              strokeDasharray="18 16"
            />
          </svg>

          <div className="absolute inset-[58px] rounded-full border border-sky-400/20 bg-slate-950/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold tracking-[0.3em] text-sky-200/80">
              {message}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
