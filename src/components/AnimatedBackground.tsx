export const AnimatedBackground = () => {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-70" />
      <div className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-primary/25 blur-3xl animate-blob" />
      <div className="absolute top-20 -right-32 h-[420px] w-[420px] rounded-full bg-primary-glow/30 blur-3xl animate-blob-2" />
      <div className="absolute bottom-0 left-1/3 h-[380px] w-[380px] rounded-full bg-accent/40 blur-3xl animate-blob" style={{ animationDelay: "-6s" }} />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  );
};
