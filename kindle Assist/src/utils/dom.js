import isJapanese from '../isJapanese';
import toKana, { createRomajiToKanaMap } from '../toKana';
import mergeWithDefaultOptions from './mergeWithDefaultOptions';

let LISTENERS = [];
/**
 * Automagically replaces input values with converted text to kana
 * @param  {defaultOptions} [options] user config overrides, default conversion is toKana()
 * @return {Function} event handler with bound options
 * @private
 */
export function makeOnInput(options) {
  let prevInput;

  // Enforce IMEMode if not already specified
  const mergedConfig = Object.assign({}, mergeWithDefaultOptions(options), {
    IMEMode: options.IMEMode || true,
  });

  const preConfiguredMap = createRomajiToKanaMap(
    mergedConfig.IMEMode,
    mergedConfig.useObsoleteKana,
    mergedConfig.customKanaMapping
  );

  const triggers = [
    ...Object.keys(preConfiguredMap),
    ...Object.keys(preConfiguredMap).map((char) => char.toUpperCase()),
  ];

  return function onInput({ target }) {
    if (
      target.value !== prevInput
      && target.dataset.ignoreComposition !== 'true'
    ) {
      convertInput(target, mergedConfig, preConfiguredMap, triggers, prevInput);
    }
  };
}

export function convertInput(target, options, map, triggers, prevInput) {
  const [head, textToConvert, tail] = splitInput(
    target.value,
    target.selectionEnd,
    triggers
  );
  const convertedText = toKana(textToConvert, options, map);
  const changed = textToConvert !== convertedText;

  if (changed) {
    const newCursor = head.length + convertedText.length;
    const newValue = head + convertedText + tail;
    // eslint-disable-next-line no-param-reassign
    target.value = newValue;
    // eslint-disable-next-line no-param-reassign
    prevInput = newValue;

    if (tail.length) {
      // push later on event loop (otherwise mid-text insertion can be 1 char too far to the right)
      setTimeout(() => target.setSelectionRange(newCursor, newCursor), 1);
    } else {
      target.setSelectionRange(newCursor, newCursor);
    }
  } else {
    // eslint-disable-next-line no-param-reassign
    prevInput = target.value;
  }
}

export function onComposition({ type, target, data }) {
  // navigator.platform is not 100% reliable for singling out all OS,
  // but for determining desktop "Mac OS" it is effective enough.
  const isMacOS = /Mac/.test(window.navigator && window.navigator.platform);
  // We don't want to ignore on Android:
  // https://github.com/WaniKani/WanaKana/issues/82
  // But MacOS IME auto-closes if we don't ignore:
  // https://github.com/WaniKani/WanaKana/issues/71
  // Other platform Japanese IMEs pass through happily
  if (isMacOS) {
    if (type === 'compositionupdate' && isJapanese(data)) {
      // eslint-disable-next-line no-param-reassign
      target.dataset.ignoreComposition = 'true';
    }

    if (type === 'compositionend') {
      // eslint-disable-next-line no-param-reassign
      target.dataset.ignoreComposition = 'false';
    }
  }
}

export function trackListeners(id, inputHandler, compositionHandler) {
  LISTENERS = LISTENERS.concat({
    id,
    inputHandler,
    compositionHandler,
  });
}

export function untrackListeners({ id: targetId }) {
  LISTENERS = LISTENERS.filter(({ id }) => id !== targetId);
}

export function findListeners(el) {
  return (
    el && LISTENERS.find(({ id }) => id === el.getAttribute('data-wanakana-id'))
  );
}

// Handle non-terminal inserted input conversion:
// | -> わ| -> わび| -> わ|び -> わs|び -> わsh|び -> わshi|び -> わし|び
// or multiple ambiguous positioning (to select which "s" to work from)
// こsこs|こsこ -> こsこso|こsこ -> こsこそ|こsこ
export function splitInput(text = '', cursor = 0, triggers = []) {
  let head;
  let toConvert;
  let tail;

  if (cursor === 0 && triggers.includes(text[0])) {
    [head, toConvert, tail] = workFromStart(text, triggers);
  } else if (cursor > 0) {
    [head, toConvert, tail] = workBackwards(text, cursor);
  } else {
    [head, toConvert] = takeWhileAndSlice(
      text,
      (char) => !triggers.includes(char)
    );
    [toConvert, tail] = takeWhileAndSlice(
      toConvert,
      (char) => !isJapanese(char)
    );
  }

  return [head, toConvert, tail];
}

function workFromStart(text, catalystChars) {
  return [
    '',
    ...takeWhileAndSlice(
      text,
      (char) => catalystChars.includes(char) || !isJapanese(char, /[0-9]/)
    ),
  ];
}

function workBackwards(text = '', startIndex = 0) {
  const [toConvert, head] = takeWhileAndSlice(
    [...text.slice(0, startIndex)].reverse(),
    (char) => !isJapanese(char)
  );
  return [
    head.reverse().join(''),
    toConvert
      .split('')
      .reverse()
      .join(''),
    text.slice(startIndex),
  ];
}

function takeWhileAndSlice(source = {}, predicate = (x) => !!x) {
  const result = [];
  const { length } = source;
  let i = 0;
  while (i < length && predicate(source[i], i)) {
    result.push(source[i]);
    i += 1;
  }
  return [result.join(''), source.slice(i)];
}
