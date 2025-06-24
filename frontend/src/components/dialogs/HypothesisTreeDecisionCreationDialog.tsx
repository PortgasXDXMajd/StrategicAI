import { z } from 'zod';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { FormControl } from '@mui/material';
import LoadingComponent from '../general/LoadingCompnent';
import { FormField, FormItem, FormMessage } from '../ui/form';
import { Textarea } from '../ui/textarea';
import { Slider, Switch } from '@mui/material';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import TreeDecisionHelper from '@/redux/helpers/tree_decision/TreeAnalysisHelper';
import { HypothesisTreeDecision } from '@/utils/types/hypothesis_tree_res';

interface HypothesisDecisionDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
}

const schema = z.object({
  hypothesis: z.boolean(),
  explanation: z
    .string()
    .min(10, 'Explanation is required and must be at least 10 characters.'),
  certainty: z.number().min(0).max(100, 'Certainty must be between 0 and 100.'),
});

const defaultValues = {
  hypothesis: false,
  explanation: '',
  certainty: 50,
};

const HypothesisTreeDecisionDialog = ({
  isDialogOpen,
  setIsDialogOpen,
}: HypothesisDecisionDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingDecision, setIsDeletingDecision] = useState(false);

  const selectedTree = useSelector(
    (state: RootState) => state.trees.selectedTree
  );
  const existingDecision = useSelector(
    (state: RootState) => state.treeDecision.treeDecisions[selectedTree?.id!]
  );

  const form = useForm({
    mode: 'onSubmit',
    defaultValues: defaultValues,
    resolver: zodResolver(schema),
  });

  const castToHypothesisTreeDecision = (
    payload: any
  ): HypothesisTreeDecision | null => {
    try {
      return payload as HypothesisTreeDecision;
    } catch {
      console.warn('Failed to cast payload to HypothesisTreeDecision');
      return null;
    }
  };

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setIsLoading(true);

    try {
      const payload = {
        answer_technique: 'user input',
        answer: `${data.hypothesis ? 'True' : 'False'}.\n\n${data.explanation}`,
        certainty: data.certainty,
      };

      await TreeDecisionHelper.upsert(selectedTree?.id!, payload);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving hypothesis decision:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isDialogOpen) {
      if (existingDecision) {
        const castedPayload = castToHypothesisTreeDecision(
          existingDecision.payload
        );

        if (castedPayload) {
          form.reset({
            hypothesis: castedPayload.answer.toLowerCase().includes('true'),
            explanation: castedPayload.answer,
            certainty: castedPayload.certainty,
          });
        } else {
          form.reset(defaultValues);
        }
      } else {
        form.reset(defaultValues);
      }
    }
  }, [isDialogOpen, existingDecision, form]);

  useEffect(() => {
    if (isDialogOpen && selectedTree) {
      const getDecision = async () => {
        await TreeDecisionHelper.get(selectedTree!.id);
      };
      getDecision();
    }
  }, [isDialogOpen, selectedTree]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="min-h-[50vh] max-h-fit min-w-[40vw] max-w-fit">
        <DialogHeader>
          <div className="flex justify-between items-center pr-10">
            <DialogTitle>
              {existingDecision
                ? 'Edit Hypothesis Decision'
                : 'Create Hypothesis Decision'}
            </DialogTitle>
            {existingDecision && (
              <div className="space-x-2">
                <Button
                  variant={'outline'}
                  onClick={async () => {
                    setIsDeletingDecision(true);
                    await TreeDecisionHelper.delete(selectedTree!);
                    setIsDeletingDecision(true);
                    setIsDialogOpen(false);
                  }}
                >
                  {isDeletingDecision ? (
                    <LoadingComponent text="Deleting..." />
                  ) : (
                    'Delete Decision'
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="hypothesis"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <label>Hypothesis: {field.value ? 'True' : 'False'}</label>
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    disabled={isLoading}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="explanation"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormControl>
                    <Textarea
                      className="mt-2 resize-none h-[20vh]"
                      placeholder="Provide a detailed explanation..."
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
              name="certainty"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <label>Certainty: {field.value}%</label>
                  <Slider
                    value={field.value}
                    onChange={(_, value) => field.onChange(value)}
                    disabled={isLoading}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                  />
                  <FormMessage />
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
  );
};

export default HypothesisTreeDecisionDialog;
