'use client';

import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { toast } from 'sonner';
import { axios } from '@/utils/helpers/AxiosHelper';
import LoadingComponent from '@/components/general/LoadingCompnent';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const defaultValues = {
  email: '',
  password: '',
};

const RegisterForm = () => {
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm({
    defaultValues,
    mode: 'onSubmit',
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setIsLoading(true);
    try {
      const res = await axios.post('/auth/register', {
        email: data.email,
        password: data.password,
      });
      if (res.status === 200) {
        toast('Success', {
          description: 'Registration was successful',
        });
        router.push('/login');
      } else {
        toast('Error', {
          description: res?.data?.message || 'Registration failed',
          action: {
            label: 'Close',
            onClick: () => toast.dismiss(),
          },
        });
      }
    } catch (error) {
      toast('Error', {
        description: 'Registration failed',
        action: {
          label: 'Close',
          onClick: () => toast.dismiss(),
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form className="grid gap-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <FormField
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="email" className="text-md">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter your email"
                    className="py-3 px-4"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-2">
          <FormField
            name="password"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="password" className="text-md">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      placeholder="Enter your password"
                      type={isPasswordShown ? 'text' : 'password'}
                      className="py-3 px-4"
                    />
                    <Button
                      type="button"
                      onClick={() => setIsPasswordShown(!isPasswordShown)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 transform rounded-full bg-transparent px-3 py-2 text-black shadow-none hover:bg-gray-200 dark:text-white dark:hover:bg-gray-800"
                    >
                      {isPasswordShown ? <EyeOpenIcon /> : <EyeClosedIcon />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          className="w-full py-3 text-sm text-white bg-primary hover:bg-primary-dark mt-6"
        >
          {isLoading ? <LoadingComponent /> : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
};

export default RegisterForm;
