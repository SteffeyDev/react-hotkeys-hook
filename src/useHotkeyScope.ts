import React, { useEffect } from 'react';
import hotkeys from 'hotkeys-js';

export function useHotkeyScope(scope?: string, setOnMount: boolean = true): { enableScope: () => void, disableScope: () => void } {
  // If they don't provide a scope name, generate a random one
  // Because useHotkey automatically uses the current scope, they don't actually
  //  need to know the scope name to use scoped hotkeys
  const actualScope: string = scope ?? '_' + Math.random().toString(36).substr(2, 9);

  useEffect(() => {
    // By default, this scope is enabled on mount and disabled on dismount
    if (setOnMount) hotkeys.setScope(actualScope);
    return () => hotkeys.deleteScope(actualScope);
  }, []);

  // Allow them to manually enable (set) and disable (destroy) the scope
  // This is needed when setOnMount is false, but could be used in other situations as well
  return {
    enableScope: () => hotkeys.setScope(actualScope),
    disableScope: () => hotkeys.deleteScope(actualScope)
  };
}
