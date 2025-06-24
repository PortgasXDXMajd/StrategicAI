'use client';

import { setCompanyInfo } from '@/redux/company/companySlice';
import { useRouter } from 'next/navigation';
import { axios } from '@/utils/helpers/AxiosHelper';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { RootState } from '@/redux/store';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CompanyInfoGatheringPageProps {
  params: {};
}

const CompanyInfoGatheringPage = ({
  params: {},
}: CompanyInfoGatheringPageProps) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const company = useSelector((state: RootState) => state.company);

  if (!company.profile?.questions_to_user) {
    return <LoadingComponent />;
  }

  const questionsSchema = company.profile?.questions_to_user?.reduce(
    (schema: any, question: string) => {
      schema[question] = z.string();
      return schema;
    },
    {}
  );

  const FormSchema = z.object(questionsSchema);

  const form = useForm<any>({
    resolver: zodResolver(FormSchema),
    defaultValues: company.profile?.questions_to_user?.reduce(
      (defaults: any, question: string) => {
        defaults[question] = '';
        return defaults;
      },
      {}
    ),
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    console.log(data);
    try {
      const answers = company.profile?.questions_to_user?.reduce(
        (acc, question) => ({
          ...acc,
          [question]: data[question],
        }),
        {}
      );

      const response = await axios.put(
        `/company/question-answer?continuation_token=${company.continuation_token}`,
        {
          qa: answers,
        }
      );

      if (response.status !== 200) {
        throw new Error('Failed to submit answers.');
      }

      const { id, login_email, first_login, profile, continuation_token } =
        response.data.body;

      dispatch(
        setCompanyInfo({
          id: id,
          login_email: login_email,
          first_login: first_login,
          profile: profile,
          continuation_token: continuation_token,
        })
      );

      toast('Success', {
        description: 'Thank you for your time',
      });

      router.push('/');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center min-h-screen p-5 overflow-hidden">
      <div className="w-full max-w-screen-xl p-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          We are almost done, we just need to ask few questions
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ScrollArea className="max-h-[70vh] h-[70vh] w-full rounded-md border p-5 overflow-y-auto">
              {company.profile?.questions_to_user?.map((question, index) => (
                <div key={index}>
                  {/* Separator between questions */}
                  {index !== 0 && <div className="border-t my-4" />}{' '}
                  {/* Adds a line with padding between questions */}
                  <FormField
                    control={form.control}
                    name={question} // Use the question as the key for each field
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{question}</FormLabel>
                        <FormControl>
                          <Textarea
                            className="mt-2" // Margin to keep textarea away from the edge
                            placeholder="Type your answer here..."
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </ScrollArea>

            <div className="w-full flex justify-end">
              <Button
                type="submit"
                className="py-4 min-w-96 text-lg font-bold rounded-md"
                disabled={isLoading} // Disable button when loading
              >
                {isLoading ? <LoadingComponent /> : 'Submit'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CompanyInfoGatheringPage;
