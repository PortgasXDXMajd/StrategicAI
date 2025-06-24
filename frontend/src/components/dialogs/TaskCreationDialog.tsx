import { z } from 'zod';
import Iconify from '../general/Iconify';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { FormControl } from '@mui/material';
import LoadingComponent from '../general/LoadingCompnent';
import { FormField, FormItem, FormMessage } from '../ui/form';
import { Textarea } from '../ui/textarea';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addTask, selectTask } from '@/redux/task/taskSlice';
import { axios } from '@/utils/helpers/AxiosHelper';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import TaskTypeRecommendationComponent from '../recommendations/TaskTypeRecommendationComponent';
import { Checkbox } from '../ui/checkbox';

interface TaskCreationParams {
  buttonText?: string;
  buttonVarient?:
    | 'link'
    | 'ghost'
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | null
    | undefined;
  buttonSize?: 'default' | 'icon' | 'sm' | 'lg' | null | undefined;
}

export interface Recommendation {
  certainty: number;
  explanation: string;
  short_display_title: string;
  type: string;
  tree_type: string;
}

const schema = z.object({
  description: z.string().min(1, 'Description is required'),
  type: z.string().optional(),
  includeCompanyContext: z.boolean().optional(),
});

const defaultValues = {
  description: '',
  type: 'none',
  includeCompanyContext: true,
};

const TaskCreationDialog = ({
  buttonText = '',
  buttonVarient = 'ghost',
  buttonSize = 'icon',
}: TaskCreationParams) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const dispatch = useDispatch();

  const form = useForm({
    mode: 'onSubmit',
    defaultValues,
    resolver: zodResolver(schema),
  });

  const handleBackClick = () => {
    setRecommendations([]);
    setShowRecommendations(false);
  };

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setIsLoading(true);

    if (data.type === 'none') {
      try {
        const response = await axios.post('/task/recommendation', {
          description: data.description,
        });

        if (response.data.result === 200) {
          setRecommendations(response.data.body.recommendation);
          setShowRecommendations(true);
        } else {
          console.error('Recommendation failed:', response.data.message);
        }
      } catch (error) {
        console.error(
          'An error occurred while fetching recommendations:',
          error
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      createTask(data);
    }
  };

  const createTask = async (data: z.infer<typeof schema>) => {
    setIsLoading(true);

    try {
      const response = await axios.post('/task', {
        description: data.description,
        type: data.type,
        include_company_context: data.includeCompanyContext,
      });

      if (response.data.result === 200) {
        const createdTask = response.data.body;

        dispatch(addTask(createdTask));
        dispatch(selectTask(createdTask.id));

        setIsDialogOpen(false);
      } else {
        console.error('Task creation failed:', response.data.message);
      }
    } catch (error) {
      console.error('An error occurred while creating the task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecommendationSelection = (recommendation: any) => {
    createTask({
      description: form.getValues('description'),
      type: recommendation.type,
      includeCompanyContext: form.getValues('includeCompanyContext'),
    });
  };

  useEffect(() => {
    if (!isDialogOpen) {
      form.reset(defaultValues);
      setShowRecommendations(false);
      setRecommendations([]);
    }
  }, [isDialogOpen, form]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVarient} size={buttonSize}>
          <Iconify icon={'ic:round-plus'} />
          {buttonText && <span>{buttonText}</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="min-h-[50vh] max-h-fit min-w-[40vw] max-w-fit">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>
            Describe the task and select the type of task.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name={'description'}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormControl>
                    <Textarea
                      className="mt-2 resize-none h-[30vh]"
                      placeholder="Tell us what is happening..."
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={'includeCompanyContext'}
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeCompanyContext"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      About my company
                    </label>
                  </div>
                </FormItem>
              )}
            />

            {!showRecommendations ? (
              <>
                <FormField
                  control={form.control}
                  name={'type'}
                  render={({ field }) => (
                    <div>
                      <span>Task Type [optional]</span>
                      <FormItem className="flex justify-center mt-4">
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="flex min-w-[30vw] items-center justify-between"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="problem" id="t1" />
                              <Label htmlFor="t1">Problem</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="goal" id="t2" />
                              <Label htmlFor="t2">Goal</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="hypothesis" id="t3" />
                              <Label htmlFor="t3">Hypothesis</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="none" id="t4" />
                              <Label htmlFor="t4">I am not sure</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </div>
                  )}
                />
              </>
            ) : (
              <div className="space-y-4">
                <p className="font-bold">Our Recommendations</p>
                <div className="flex space-x-5 justify-center">
                  {recommendations.length > 0 &&
                    recommendations.map((rec) => (
                      <TaskTypeRecommendationComponent
                        recommendation={rec}
                        handleRecommendationSelection={
                          handleRecommendationSelection
                        }
                      />
                    ))}
                </div>
              </div>
            )}

            <DialogFooter>
              {!isLoading && (
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </DialogClose>
              )}
              {!showRecommendations && (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <LoadingComponent /> : 'Create'}
                </Button>
              )}
              {showRecommendations && (
                <Button onClick={handleBackClick}>{'Back'}</Button>
              )}
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default TaskCreationDialog;
