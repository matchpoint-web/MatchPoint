export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="absolute top-1/3 -right-32 h-[400px] w-[400px] rounded-full bg-emerald-400/5 blur-[100px]" />
      <div className="absolute bottom-0 -left-32 h-[350px] w-[350px] rounded-full bg-emerald-600/8 blur-[90px]" />
    </div>
  );
}
