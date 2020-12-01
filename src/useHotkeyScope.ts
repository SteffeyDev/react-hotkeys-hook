import React, { useEffect } from 'react';
import hotkeys from 'hotkeys-js';

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function useHotkeyScope(scope?: string, setOnMount?: boolean): { enableScope: () => void, disableScope: () => void } {
  const actualScope: string = scope ?? uuidv4();
  useEffect(() => {
    if (setOnMount) hotkeys.setScope(actualScope);
    return () => hotkeys.deleteScope(actualScope);
  }, []);
  return {
    enableScope: () => hotkeys.setScope(actualScope),
    disableScope: () => hotkeys.deleteScope(actualScope)
  };
}
