import hotkeys from 'hotkeys-js';
import { useRef, useCallback, useEffect } from 'react';

function useIsHotkeyPressed() {
  return hotkeys.isPressed;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

hotkeys.filter = function () {
  return true;
};

function useHotkeys(keys, callback, options, deps) {
  var _options;

  if (options instanceof Array) {
    deps = options;
    options = undefined;
  } // If they have loaded a custom scope using useHotkeyScope,
  // then restrict this hotkey to that scope


  if (!((_options = options) != null && _options.scope) && hotkeys.getScope() !== 'all') {
    options = _extends({}, options, {
      scope: hotkeys.getScope()
    });
  }

  var _ref = options || {},
      enableOnTags = _ref.enableOnTags,
      filter = _ref.filter,
      keyup = _ref.keyup,
      keydown = _ref.keydown;

  var ref = useRef(null); // Always filter out events on these three tags, unless the enableOnTags prop says otherwise

  var blockTags = ['INPUT', 'TEXTAREA', 'SELECT'].filter(function (tag) {
    return !enableOnTags || !enableOnTags.includes(tag);
  });
  var memoisedCallback = useCallback(function (keyboardEvent, hotkeysEvent) {
    var _keyboardEvent$target, _keyboardEvent$srcEle;

    // If we have a filter, then exit early if the event does not match
    if (filter && !filter(keyboardEvent)) return false; // Otherwise, if no filter, check if the event is on a tag that we want to ignore

    var targetTagName = ((_keyboardEvent$target = keyboardEvent.target) == null ? void 0 : _keyboardEvent$target.tagName) || ((_keyboardEvent$srcEle = keyboardEvent.srcElement) == null ? void 0 : _keyboardEvent$srcEle.tagName);
    if (!filter && targetTagName && blockTags.includes(targetTagName)) return false; // If we have a valid ref, and that ref is not the active element, then exit

    if (ref.current && document.activeElement !== ref.current) return false;
    callback(keyboardEvent, hotkeysEvent);
    return true;
  }, deps ? [ref].concat(deps) : [ref]);
  useEffect(function () {
    if (keyup && keydown !== true) {
      options.keydown = false;
    }

    hotkeys(keys, options || {}, memoisedCallback);
    return function () {
      return hotkeys.unbind(keys, memoisedCallback);
    };
  }, [memoisedCallback, options, enableOnTags, filter, keys]);
  return ref;
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
}

function useHotkeyScope(scope, setOnMount) {
  var actualScope = scope != null ? scope : uuidv4();
  useEffect(function () {
    if (setOnMount) hotkeys.setScope(actualScope);
    return function () {
      return hotkeys.deleteScope(actualScope);
    };
  }, []);
  return {
    enableScope: function enableScope() {
      return hotkeys.setScope(actualScope);
    },
    disableScope: function disableScope() {
      return hotkeys.deleteScope(actualScope);
    }
  };
}

export { useHotkeyScope, useHotkeys, useIsHotkeyPressed };
//# sourceMappingURL=react-hotkeys-hook.esm.js.map
