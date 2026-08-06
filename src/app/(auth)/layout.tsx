export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-charcoal-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl gold-gradient shadow-gold-glow mb-4">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <h1 className="text-2xl font-bold text-white">CUE</h1>
          <p className="text-charcoal-400 text-sm mt-1">by HASI Technologies</p>
        </div>
        {children}
      </div>
    </div>
  );
}
