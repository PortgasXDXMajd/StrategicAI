import { TooltipProvider } from '@/components/ui/tooltip';
import AuthGuard from '../(auth)/AuthGuard';
import Navbar from '@/components/general/NavBar';
import { ThemeProvider } from '@/context/ThemeProvider';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="font-mono">
      <ThemeProvider>
        <AuthGuard>
          <TooltipProvider>
            <Navbar />
            <div className="flex h-screen flex-col gap-5 pt-14">{children}</div>
          </TooltipProvider>
        </AuthGuard>
      </ThemeProvider>
    </div>
  );
}
