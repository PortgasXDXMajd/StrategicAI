import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import RegisterForm from '@/components/forms/auth/RegisterForm';

const RegistrationPage = () => {
  return (
    <div className="flex w-full items-center justify-center">
      <Card className="w-full max-w-[35vw] p-6 border-none">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-left">
            Register
          </CardTitle>
          <CardDescription className="text-left mt-2 text-gray-500">
            Enter your email and password to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <div className="mt-10 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline text-primary">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationPage;
