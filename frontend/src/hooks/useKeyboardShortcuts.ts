import { useEffect } from 'react';

interface KeyboardShortcuts {
  onRefresh?: () => void;
  onQuickApprove?: () => void;
  onQuickReject?: () => void;
  onBulkMode?: () => void;
  onSearch?: () => void;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger if not typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const { ctrlKey, altKey, key } = event;

      // Ctrl+R: Refresh
      if (ctrlKey && key === 'r') {
        event.preventDefault();
        shortcuts.onRefresh?.();
      }

      // Alt+A: Quick Approve
      if (altKey && key === 'a') {
        event.preventDefault();
        shortcuts.onQuickApprove?.();
      }

      // Alt+R: Quick Reject
      if (altKey && key === 'r') {
        event.preventDefault();
        shortcuts.onQuickReject?.();
      }

      // Alt+B: Toggle Bulk Mode
      if (altKey && key === 'b') {
        event.preventDefault();
        shortcuts.onBulkMode?.();
      }

      // Ctrl+F: Focus Search
      if (ctrlKey && key === 'f') {
        event.preventDefault();
        shortcuts.onSearch?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};