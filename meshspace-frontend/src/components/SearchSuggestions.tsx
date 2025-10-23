import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icon } from '@iconify/react';
import { mentionService } from '@/services/mention.service';

interface SearchSuggestionsProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number; width: number };
}

const SearchSuggestions = ({ query, isOpen, onClose, position }: SearchSuggestionsProps) => {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['search-suggestions', query],
    queryFn: () => mentionService.searchUsers(query),
    enabled: query.length > 1,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Safely extract users array from response
  const users = Array.isArray(response?.data) ? response.data : [];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!users.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % users.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + users.length) % users.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (users[selectedIndex]) {
          navigate(`/profile/${users[selectedIndex]._id}`);
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, selectedIndex, users]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen || query.length < 2) {
    return null;
  }

  return (
    <div
      ref={listRef}
      className="absolute z-50 bg-background border rounded-lg shadow-lg max-h-60 overflow-y-auto"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
      }}
    >
      {isLoading ? (
        <div className="p-3 text-center text-muted-foreground">
          <Icon icon="mdi:loading" className="w-4 h-4 animate-spin mx-auto" />
          <span className="ml-2">Searching...</span>
        </div>
      ) : error ? (
        <div className="p-3 text-center text-destructive">
          <Icon icon="mdi:alert-circle" className="w-4 h-4 mx-auto mb-1" />
          <div className="text-xs">Search failed</div>
        </div>
      ) : (
        <>
          {users.length === 0 ? (
            <div className="p-3 text-center text-muted-foreground">
              No users found
            </div>
          ) : (
            <>
              <div className="p-2 text-xs font-medium text-muted-foreground border-b">
                Users
              </div>
              {users.map((user: any, index: number) => (
                <div
                  key={user._id}
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 ${
                    index === selectedIndex ? 'bg-muted' : ''
                  }`}
                  onClick={() => {
                    navigate(`/profile/${user._id}`);
                    onClose();
                  }}
                >
                  <Avatar className="size-8">
                    {user.avatar && <AvatarImage src={user.avatar} alt={user.username} />}
                    <AvatarFallback>{user.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      @{user.username}
                    </div>
                  </div>
                </div>
              ))}
              <div className="p-2 text-xs text-muted-foreground border-t">
                Press Enter to search for "{query}"
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SearchSuggestions;
