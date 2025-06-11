import { useEffect } from 'react';

type HotkeyCallback = (event: KeyboardEvent) => void;

export const useHotkeys = (hotkeys: Record<string, HotkeyCallback>) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const key in hotkeys) {
        const parts = key.split('+').map(part => part.trim().toLowerCase());
        const specialKeys = parts.slice(0, -1);
        const mainKey = parts[parts.length - 1];

        const isCmdOrCtrl = event.metaKey || event.ctrlKey;
        
        let match = true;
        if (specialKeys.includes('cmd') || specialKeys.includes('ctrl')) {
          if (!isCmdOrCtrl) match = false;
        }
        if (specialKeys.includes('shift')) {
          if (!event.shiftKey) match = false;
        }
        if (specialKeys.includes('alt')) {
          if (!event.altKey) match = false;
        }

        if (event.key.toLowerCase() === mainKey && match) {
          event.preventDefault();
          hotkeys[key](event);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hotkeys]);
}; 