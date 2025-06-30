import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PostCard, { type Post } from '@/components/PostCard';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import API from '@/lib/axios';
import { Icon } from '@iconify/react';

interface User {
  _id: string;
  username: string;
  avatar?: string;
}

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const highlight = (text: string, query: string) => {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.split(regex).map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-primary/20 text-primary font-semibold rounded px-1">{part}</mark> : part
  );
};

const SearchPage = () => {
  const query = useQuery().get('q') || '';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<{ users: User[]; posts: Post[] }>({ users: [], posts: [] });

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setError('');
    API.get(`/search?q=${encodeURIComponent(query)}`)
      .then(res => setResults(res.data))
      .catch(() => setError('Failed to fetch search results'))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="max-w-2xl mx-auto py-10 px-2">
      <h2 className="text-2xl font-bold mb-6">Search results for <span className="text-primary">"{query}"</span></h2>
      {loading && <div className="text-center text-muted-foreground">Loading...</div>}
      {error && <div className="text-center text-destructive">{error}</div>}
      {!loading && !error && (
        <>
          <div className="mb-8 bg-card border rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Icon icon="mdi:account" className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Users</h3>
            </div>
            {results.users.length === 0 ? (
              <div className="text-muted-foreground italic">No users found matching <span className="font-semibold">"{query}"</span>.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {results.users.map(user => (
                  <Link to={`/profile/${user._id}`} key={user._id} className="flex items-center gap-3 p-2 rounded hover:bg-accent transition-colors">
                    <Avatar className="size-8">
                      {user.avatar ? <AvatarImage src={user.avatar} alt={user.username} /> : <AvatarFallback>{user.username[0]}</AvatarFallback>}
                    </Avatar>
                    <span className="font-medium">{highlight(user.username, query)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="my-8 border-t border-border/40" />
          <div className="bg-card border rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Icon icon="mdi:file-document-outline" className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Posts</h3>
            </div>
            {results.posts.length === 0 ? (
              <div className="text-muted-foreground italic">No posts found matching <span className="font-semibold">"{query}"</span>.</div>
            ) : (
              <div className="flex flex-col gap-4">
                {results.posts.map(post => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchPage; 