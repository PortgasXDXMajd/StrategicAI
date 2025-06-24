'use client';

import { z } from 'zod';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { AvatarFallback, Avatar } from '../ui/avatar';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { FormControl } from '@mui/material';
import LoadingComponent from './LoadingCompnent';
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LocalStorageHelper } from '@/utils/helpers/LocalStorageHelper';
import { DialogTrigger } from '@radix-ui/react-dialog';
import Iconify from './Iconify';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ThemeSwitcher from './ThemeSwitcher';
import { navbarLinks } from '@/constants';
import { useSessionContext } from '@/context/SessionContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { setCompanyInfo } from '@/redux/company/companySlice';
import { axios } from '@/utils/helpers/AxiosHelper';
import { taskLogout } from '@/redux/task/taskSlice';
import { companyLogout } from '@/redux/company/companySlice';
import { tabLogout } from '@/redux/tab/tabSlice';
import { useTheme } from '@/context/ThemeProvider';

const schema = z.object({
  model: z.string().min(1, 'Model Name is required'),
});

const Navbar = () => {
  const { mode } = useTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const dispatch = useDispatch();
  const pathname = usePathname();
  const { clearSession } = useSessionContext();
  const company = useSelector((state: RootState) => state.company) ?? {
    profile: { company_name: '' },
  };

  const defaultValues = {
    model: 'gpt-4o-mini',
  };

  const form = useForm({
    mode: 'onSubmit',
    defaultValues,
    resolver: zodResolver(schema),
  });
  const { setValue, handleSubmit, reset } = form;

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      LocalStorageHelper.setLLMConfigs(JSON.stringify(data));
      setIsDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileClick = () => {
    router.push(`/company/profile`);
  };

  const handleLogout = () => {
    clearSession();
    dispatch(taskLogout());
    dispatch(companyLogout());
    dispatch(tabLogout());
    router.push('/login');
  };

  const fetchCompanyInfo = async () => {
    try {
      const response = await axios.get('/company');

      if (response.status === 200) {
        dispatch(setCompanyInfo(response.data.body));
      } else {
        console.error('Failed to fetch company info:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching company info:', error);
    }
  };

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  useEffect(() => {
    const storedConfig = LocalStorageHelper.getLLMConfigs();
    if (storedConfig) {
      const parsedConfig = JSON.parse(storedConfig);
      reset(parsedConfig);
    }
  }, [reset]);

  return (
    <nav className="fixed z-50 flex w-full h-14 items-center justify-between px-10 py-3 backdrop-blur-lg bg-background/80">
      <Link href="/" className="flex items-center gap-3">
        {mode == 'dark' && (
          <img src="/logos/red_logo.svg" alt="LOGO" width={30} height={30} />
        )}
        {mode == 'light' && (
          <img src="/logos/blue_logo.svg" alt="LOGO" width={30} height={30} />
        )}

        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Strategic<span className="text-primary">AI</span>
        </p>
      </Link>

      <div className="hidden items-center gap-6 md:flex">
        {navbarLinks.map((link, index) => {
          const isActive =
            (pathname.includes(link.route) && link.route.length > 1) ||
            pathname === link.route;
          return (
            <Link key={index} href={link.route}>
              <p
                className={`
                  text-lg font-medium transition-colors duration-300 ${
                    isActive
                      ? 'text-primary dark:text-secondary'
                      : 'text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-secondary'
                  }
                `}
              >
                {link.label}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        <ThemeSwitcher />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {`${company?.profile?.company_name?.charAt(0).toUpperCase() ?? ''}${company?.profile?.company_name?.charAt(1).toUpperCase() ?? ''}`}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mt-2 bg-[#F9F9F9] dark:bg-[#181818] shadow-lg rounded-md py-2 w-60">
              <DropdownMenuLabel>
                {company.profile?.company_name}{' '}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleProfileClick}
                className="cursor-pointer items-center space-x-3 "
              >
                <Iconify icon="mdi:account-outline" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  className="cursor-pointer items-center space-x-3 "
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Iconify icon="mingcute:ai-line" />
                  <span>LLM Configs</span>
                </DropdownMenuItem>
              </DialogTrigger>
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer items-center space-x-3"
              >
                <Iconify icon="mdi:logout" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>LLM Configs</DialogTitle>
            </DialogHeader>

            <FormProvider {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        value={field.value}
                        onValueChange={(v) => setValue('model', v)}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[300px]">
                            <SelectValue placeholder="Select a model source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>OpenAI</SelectLabel>
                            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                            <SelectItem value="gpt-4o-mini">
                              GPT-4o-mini
                            </SelectItem>
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>DeepSeek</SelectLabel>
                            <SelectItem value="accounts/fireworks/models/deepseek-r1">
                              DeepSeek R1 -- 8$/M Token
                            </SelectItem>
                            <SelectItem value="accounts/fireworks/models/deepseek-v3">
                              DeepSeek V3 -- 0.9$/M Token
                            </SelectItem>
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>Llama</SelectLabel>
                            <SelectItem value="accounts/fireworks/models/llama4-maverick-instruct-basic">
                              Llama 4 Maverick Instruct (Basic) -- 0.22$/M Token
                            </SelectItem>
                            <SelectItem value="accounts/fireworks/models/llama4-scout-instruct-basic">
                              Llama 4 Scout Instruct (Basic) -- 0.15$/M Token
                            </SelectItem>
                            <SelectItem value="accounts/fireworks/models/llama-v3p3-70b-instruct">
                              Llama-3.3-70B -- 0.9$/M Token
                            </SelectItem>
                            <SelectItem value="accounts/fireworks/models/llama-v3p2-3b-instruct">
                              Llama-3.2-3B -- 0.1$/M Token
                            </SelectItem>
                            <SelectItem value="accounts/fireworks/models/llama-v3p1-8b-instruct">
                              Llama-3.1-8B -- 0.2$/M Token
                            </SelectItem>
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>Qwen</SelectLabel>
                            <SelectItem value="accounts/fireworks/models/qwen2p5-72b-instruct">
                              Qwen-2.5-72B -- 0.9$/M Token
                            </SelectItem>
                            <SelectItem value="accounts/fireworks/models/qwen3-30b-a3b">
                              Qwen3 30B-A3B -- 0.15$/M Token
                            </SelectItem>
                            <SelectItem value="accounts/fireworks/models/qwen3-235b-a22b">
                              Qwen3 235B-A22B -- 0.15$/M Token
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  {!isLoading && (
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">
                        Close
                      </Button>
                    </DialogClose>
                  )}
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? <LoadingComponent /> : 'Save'}
                  </Button>
                </DialogFooter>
              </form>
            </FormProvider>
          </DialogContent>
        </Dialog>
      </div>
    </nav>
  );
};

export default Navbar;
