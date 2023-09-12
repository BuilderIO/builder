const isSafari =
  typeof window !== 'undefined' &&
  /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);

const isClient = typeof window !== 'undefined';

// TODO: queue all of these in a debounceNextTick
export function nextTick(fn: () => void) {
  // if (typeof process !== 'undefined' && process.nextTick) {
  //   console.log('process.nextTick?');
  //   process.nextTick(fn);
  //   return;
  // }
  // FIXME: fix the real safari issue of this randomly not working
  if (!isClient || isSafari || typeof MutationObserver === 'undefined') {
    setTimeout(fn);
    return;
  }
  let called = 0;
  const observer = new MutationObserver(() => fn());
  const element = document.createTextNode('');
  observer.observe(element, {
    characterData: true,
  });
  // tslint:disable-next-line
  element.data = String((called = ++called));
}
