import Link from 'next/link';
import LoginForm from '@/components/forms/auth/LoginForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const LoginPage = () => {
  return (
    <div className="flex w-full items-center justify-center">
      <Card className="w-full max-w-[35vw] p-6 border-none">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-left">Login</CardTitle>
          <CardDescription className="text-left mt-2 text-gray-500">
            Enter your email and password to login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-10 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="underline text-primary">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
