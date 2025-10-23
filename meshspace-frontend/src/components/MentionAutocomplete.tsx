import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MentionAutocompleteProps {
  items: any[];
  command: (item: any) => void;
}

const MentionAutocomplete = forwardRef<any, MentionAutocompleteProps>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = items[index];
    if (item) {
      command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + items.length - 1) % items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="bg-background border rounded-lg shadow-lg max-h-60 overflow-y-auto p-2">
      {items.length ? (
        items.map((item, index) => (
          <div
            key={item._id}
            className={`flex items-center gap-3 p-2 cursor-pointer rounded ${
              index === selectedIndex ? 'bg-muted' : 'hover:bg-muted/50'
            }`}
            onClick={() => selectItem(index)}
          >
            <Avatar className="size-8">
              {item.avatar && <AvatarImage src={item.avatar} alt={item.username} />}
              <AvatarFallback>{item.username[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">
                @{item.username}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="p-2 text-center text-muted-foreground">
          No users found
        </div>
      )}
    </div>
  );
});

MentionAutocomplete.displayName = 'MentionAutocomplete';

export default MentionAutocomplete;