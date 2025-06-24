interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = (props: AuthLayoutProps) => {
  const { children } = props;

  return (
    <main className="flex h-screen flex-col items-center justify-center gap-3 font-mono">
      <p className="text-4xl font-bold">
        Strategic
        <span className="text-primary">AI</span>
      </p>
      {children}
    </main>
  );
};

export default AuthLayout;
