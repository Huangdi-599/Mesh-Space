import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPoll, type CreatePollData } from '@/services/poll.service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';

interface CreatePollModalProps {
  children: React.ReactNode;
  postId?: string;
}

const CreatePollModal = ({ children, postId }: CreatePollModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [expiresAt, setExpiresAt] = useState('');
  const [allowMultiple, setAllowMultiple] = useState(false);
  const queryClient = useQueryClient();

  const createPollMutation = useMutation({
    mutationFn: (pollData: CreatePollData) => createPoll(pollData),
    onSuccess: () => {
      resetForm();
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      toast.success('Poll created successfully!');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create poll');
    },
  });

  const resetForm = () => {
    setQuestion('');
    setOptions(['', '']);
    setExpiresAt('');
    setAllowMultiple(false);
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    const validOptions = options.filter(option => option.trim());
    if (validOptions.length < 2) {
      toast.error('Please provide at least 2 options');
      return;
    }

    if (!expiresAt) {
      toast.error('Please select an expiration date');
      return;
    }

    const expirationDate = new Date(expiresAt);
    if (expirationDate <= new Date()) {
      toast.error('Expiration date must be in the future');
      return;
    }

    const pollData: CreatePollData = {
      question: question.trim(),
      options: validOptions,
      expiresAt: expirationDate.toISOString(),
      allowMultiple,
      postId
    };

    createPollMutation.mutate(pollData);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // Max 30 days
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon icon="mdi:poll" className="w-5 h-5" />
            Create New Poll
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question */}
          <div className="space-y-2">
            <Label htmlFor="question">Poll Question</Label>
            <Input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask?"
              maxLength={500}
              required
            />
            <div className="text-xs text-muted-foreground">
              {question.length}/500 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label>Poll Options</Label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  maxLength={200}
                  required
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                  >
                    <Icon icon="mdi:close" className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {options.length < 10 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="w-full"
              >
                <Icon icon="mdi:plus" className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            )}
            <div className="text-xs text-muted-foreground">
              {options.length}/10 options (minimum 2)
            </div>
          </div>

          {/* Expiration Date */}
          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expiration Date</Label>
            <Input
              id="expiresAt"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={getMinDate()}
              max={getMaxDate()}
              required
            />
            <div className="text-xs text-muted-foreground">
              Poll will close at 11:59 PM on the selected date
            </div>
          </div>

          {/* Allow Multiple Votes */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="allowMultiple">Allow Multiple Votes</Label>
              <div className="text-xs text-muted-foreground">
                Let users select multiple options
              </div>
            </div>
            <Switch
              id="allowMultiple"
              checked={allowMultiple}
              onCheckedChange={setAllowMultiple}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPollMutation.isPending}
            >
              {createPollMutation.isPending ? (
                <>
                  <Icon icon="mdi:loading" className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Icon icon="mdi:poll" className="w-4 h-4 mr-2" />
                  Create Poll
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePollModal;
