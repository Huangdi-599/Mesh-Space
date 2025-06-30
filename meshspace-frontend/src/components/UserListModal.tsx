// components/UserListModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

type User = {
  _id: string;
  username: string;
  email: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  users: User[];
};

const UserListModal = ({ open, onClose, title, users }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md animate-modal-fade-in">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {users.map((user) => (
            <div key={user._id} className="flex flex-col transition-colors duration-200 hover:bg-primary/10 rounded p-2">
              <p className="font-medium">{user.username}</p>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Separator className="mt-2" />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserListModal;

/* Add to global CSS (App.css or index.css):
@keyframes modal-fade-in {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}
.animate-modal-fade-in {
  animation: modal-fade-in 0.3s ease;
}
*/
