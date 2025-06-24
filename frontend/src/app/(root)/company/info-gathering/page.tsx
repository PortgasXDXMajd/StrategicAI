'use client';
import { countries } from '@/constants/countries';
import { setCompanyInfo } from '@/redux/company/companySlice';
import { useRouter } from 'next/navigation';
import { axios } from '@/utils/helpers/AxiosHelper';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import LoadingComponent from '@/components/general/LoadingCompnent';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CompanyInfoGatheringPageProps {
  params: {};
}

const FormSchema = z.object({
  name: z.string().min(1, 'Please tell us your company name'),
  country: z.string().min(1, 'We need to know where you operate'),
  industry: z.string().min(1, 'Industry is required'),
});

const CompanyInfoGatheringPage = ({
  params: {},
}: CompanyInfoGatheringPageProps) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      country: 'Germany',
      industry: '',
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true);

    try {
      const response = await axios.put('/company', {
        company_name: data.name,
        country: data.country,
        industry: data.industry,
      });

      if (response.status !== 200) {
        throw new Error('Failed to update company data.');
      }

      const { id, login_email, first_login, profile } = response.data.body;

      dispatch(
        setCompanyInfo({
          id: id,
          login_email: login_email,
          first_login: first_login,
          profile: profile,
          continuation_token: response.data.continuation_token,
        })
      );

      if (profile?.questions_to_user?.length ?? 0 > 0) {
        toast('Success', {
          description: 'Company info updated, but...',
        });
        router.push('/company/info-gathering/continue');
      } else {
        toast('Success', {
          description: 'We are done',
        });
        router.push('/');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center mt-10">
      <div className="w-full max-w-lg shadow-lg rounded-lg">
        <h1 className="text-4xl font-bold text-center mb-8">
          Tell us about your company
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Google, Apple, Meta..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Technology, Marketing, Software..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full py-4 text-lg font-bold rounded-md"
            >
              {isLoading ? <LoadingComponent /> : 'Update Company Info'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CompanyInfoGatheringPage;
