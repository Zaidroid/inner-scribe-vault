import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Search, Loader2, ListTodo, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
  url: string;
}

export const GlobalSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm) {
      setIsLoading(true);
      const performSearch = async () => {
        const { data, error } = await supabase.rpc('global_search', {
          search_term: debouncedSearchTerm,
        });
        
        if (error) {
          console.error('Search error:', error);
          setResults([]);
        } else {
          setResults(data);
        }
        setIsLoading(false);
      };
      performSearch();
    } else {
      setResults([]);
    }
  }, [debouncedSearchTerm]);

  const handleSelect = (url: string) => {
    navigate(url);
    setIsOpen(false);
    setSearchTerm('');
  };

  const tasks = results.filter(r => r.type === 'task');
  const teams = results.filter(r => r.type === 'team');

  return (
    <div className="relative w-full max-w-md">
      <Command shouldFilter={false} onFocus={() => setIsOpen(true)} onBlur={() => setTimeout(() => setIsOpen(false), 200)}>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <CommandInput 
                value={searchTerm}
                onValueChange={setSearchTerm}
                placeholder="Search tasks, teams..."
                className="pl-10"
            />
            {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
        </div>
        
        {isOpen && (debouncedSearchTerm.length > 0 || results.length > 0) && (
            <CommandList className="absolute top-full mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-md z-50">
            {isLoading && !results.length ? (
                <div className="p-4 text-sm text-center">Searching...</div>
            ) : (
                <>
                {results.length === 0 && !isLoading ? (
                    <CommandEmpty>No results found.</CommandEmpty>
                ) : (
                    <>
                    {tasks.length > 0 && (
                        <CommandGroup heading="Tasks">
                        {tasks.map(result => (
                            <CommandItem key={result.id} onSelect={() => handleSelect(result.url)}>
                                <ListTodo className="mr-2 h-4 w-4" />
                                <span>{result.title}</span>
                            </CommandItem>
                        ))}
                        </CommandGroup>
                    )}
                    {teams.length > 0 && (
                        <CommandGroup heading="Teams">
                        {teams.map(result => (
                            <CommandItem key={result.id} onSelect={() => handleSelect(result.url)}>
                                <Users className="mr-2 h-4 w-4" />
                                <span>{result.title}</span>
                            </CommandItem>
                        ))}
                        </CommandGroup>
                    )}
                    </>
                )}
                </>
            )}
            </CommandList>
        )}
      </Command>
    </div>
  );
}; 