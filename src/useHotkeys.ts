import hotkeys, { HotkeysEvent, KeyHandler } from 'hotkeys-js';
import React, { useCallback, useEffect, useRef } from 'react';

// Pass through all events, we'll handle filtering if needed
hotkeys.filter = () => true;

type AvailableTags = 'INPUT' | 'TEXTAREA' | 'SELECT';

export type Options = {
  filter?: typeof hotkeys.filter;
  enableOnTags?: AvailableTags[];
  splitKey?: string;
  scope?: string;
  keyup?: boolean;
  keydown?: boolean;
};

export function useHotkeys<T extends Element>(keys: string, callback: KeyHandler, options?: Options): React.MutableRefObject<T | null>;
export function useHotkeys<T extends Element>(keys: string, callback: KeyHandler, deps?: any[]): React.MutableRefObject<T | null>;
export function useHotkeys<T extends Element>(keys: string, callback: KeyHandler, options?: Options, deps?: any[]): React.MutableRefObject<T | null>;
export function useHotkeys<T extends Element>(keys: string, callback: KeyHandler, options?: any[] | Options, deps?: any[]): React.MutableRefObject<T | null> {
  if (options instanceof Array) {
    deps = options;
    options = undefined;
  }

  // If they have loaded a custom scope using useHotkeyScope,
  // then restrict this hotkey to that scope
  if (!options?.scope && hotkeys.getScope() !== 'all') {
    options = {
      ...options,
      scope: hotkeys.getScope()
    };
  }

  const { enableOnTags, filter, keyup, keydown } = options || {};
  const ref = useRef<T | null>(null);

  // Always filter out events on these three tags, unless the enableOnTags prop says otherwise
  const blockTags = (['INPUT', 'TEXTAREA', 'SELECT'] as AvailableTags[])
    .filter(tag => !enableOnTags || !enableOnTags.includes(tag));

  const memoisedCallback = useCallback((keyboardEvent: KeyboardEvent, hotkeysEvent: HotkeysEvent) => {
    // If we have a filter, then exit early if the event does not match
    if (filter && !filter(keyboardEvent)) return false;

    // Otherwise, if no filter, check if the event is on a tag that we want to ignore
    const targetTagName: string | undefined =
      (keyboardEvent.target as HTMLElement)?.tagName ||
      (keyboardEvent.srcElement as HTMLElement)?.tagName;
    if (!filter && targetTagName && blockTags.includes(targetTagName as AvailableTags)) return false;

    // If we have a valid ref, and that ref is not the active element, then exit
    if (ref.current && document.activeElement !== ref.current) return false;

    callback(keyboardEvent, hotkeysEvent);
    return true;
  }, deps ? [ref, ...deps] : [ref]);

  useEffect(() => {
    if (keyup && keydown !== true) {
      (options as Options).keydown = false;
    }

    hotkeys(keys, (options as Options) || {}, memoisedCallback);

    return () => hotkeys.unbind(keys, memoisedCallback);
  }, [memoisedCallback, options, enableOnTags, filter, keys]);

  return ref;
}
