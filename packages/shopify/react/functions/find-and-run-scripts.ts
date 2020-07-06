export function findAndRunScripts(el: Element) {
  const scripts = el.getElementsByTagName('script');
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    if (script.src) {
      const newScript = document.createElement('script');
      newScript.async = true;
      newScript.src = script.src;
      document.head.appendChild(newScript);
    } else {
      try {
        new Function(script.innerText)();
      } catch (error) {
        console.warn('Builder custom code component error:', error);
      }
    }
  }
}
