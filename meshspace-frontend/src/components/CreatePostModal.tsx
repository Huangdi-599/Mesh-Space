import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost } from '@/services/post.service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import ImagePreviewModal from './ImagePreviewModal';
import RichTextEditor from './RichTextEditor';

interface CreatePostModalProps {
  children: React.ReactNode;
}

const CreatePostModal = ({ children }: CreatePostModalProps) => {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const postMutation = useMutation({
    mutationFn: (formData: FormData) => createPost(formData),
    onSuccess: () => {
      setContent('');
      setSelectedImage(null);
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      toast.success('Post created successfully!');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create post');
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && !selectedImage) {
      toast.error('Please add some content or an image');
      return;
    }

    const formData = new FormData();
    formData.append('content', content);
    if (selectedImage) {
      formData.append('image', selectedImage);
    }
    postMutation.mutate(formData);
  };

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setImagePreviewOpen(false);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed!');
        e.target.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB!');
        e.target.value = '';
        return;
      }
      setSelectedImage(file);
      setImagePreviewOpen(true);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon icon="mdi:plus-circle" className="w-5 h-5" />
              Create New Post
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-4">
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="What's on your mind?"
                maxLength={2000}
              />

              {/* Image Preview */}
              {selectedImage && (
                <Card className="relative group">
                  <CardContent className="p-0">
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="Selected"
                      className="w-full max-h-[300px] object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 rounded-lg" />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleImageRemove}
                      >
                        <Icon icon="mdi:close" className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {selectedImage.name} ({formatFileSize(selectedImage.size)})
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Image Upload Area */}
              {!selectedImage && (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors duration-200">
                  <Icon icon="mdi:image-plus" className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Add an image to your post
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Icon icon="mdi:upload" className="w-4 h-4 mr-2" />
                    Choose Image
                  </Button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={postMutation.isPending || (!content.trim() && !selectedImage)}
              >
                {postMutation.isPending ? (
                  <>
                    <Icon icon="mdi:loading" className="w-4 h-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:send" className="w-4 h-4 mr-2" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ImagePreviewModal
        isOpen={imagePreviewOpen}
        onClose={() => setImagePreviewOpen(false)}
        imageFile={selectedImage}
        onConfirm={handleImageSelect}
        onRemove={handleImageRemove}
      />
    </>
  );
};

export default CreatePostModal;
