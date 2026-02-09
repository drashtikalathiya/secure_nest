import {
  IconShieldLock,
  IconLock,
  IconFileText,
  IconHeartbeat,
} from "@tabler/icons-react";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-full flex bg-[#101922] text-white font-sans">
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-[#0f66bd] to-[#0b3d6e] items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:22px_22px]" />

        <div className="relative z-10 flex flex-col items-center text-center gap-8 max-w-md">
          <div className="w-64 h-64 rounded-2xl bg-black/30 backdrop-blur-md shadow-2xl flex items-center justify-center">
            <IconShieldLock className="w-28 h-28 text-white/90" stroke={1.5} />
          </div>

          <h1 className="text-3xl font-bold">SecureNest</h1>
          <p className="text-blue-100 text-sm">Protecting what matters most.</p>

          <div className="flex gap-10 text-xs uppercase tracking-widest opacity-80">
            <Feature icon={IconLock} label="Passwords" />
            <Feature icon={IconFileText} label="Documents" />
            <Feature icon={IconHeartbeat} label="Medical" />
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">{children}</div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Icon size={18} />
      {label}
    </div>
  );
}
