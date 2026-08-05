export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-muted/40 px-6 py-16">
      {children}
    </div>
  );
}
