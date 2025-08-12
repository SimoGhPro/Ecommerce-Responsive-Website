export default function AuthLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="auth-layout">
        {/* Add your auth layout components here */}
        {children}
      </div>
    );
  }