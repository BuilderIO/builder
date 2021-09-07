import * as React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { useState, useContext, useRef, useEffect } from 'react';

export default function Embed(props) {
  const [scriptsInserted, setScriptsInserted] = useState(() => []);

  const [scriptsRun, setScriptsRun] = useState(() => []);

  function findAndRunScripts() {
    // TODO: Move this function to standalone one in '@builder.io/utils'
    if (elem.current && typeof window !== 'undefined') {
      /** @type {HTMLScriptElement[]} */
      const scripts = elem.current.getElementsByTagName('script');

      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];

        if (script.src) {
          if (scriptsInserted.includes(script.src)) {
            continue;
          }

          scriptsInserted.push(script.src);
          const newScript = document.createElement('script');
          newScript.async = true;
          newScript.src = script.src;
          document.head.appendChild(newScript);
        } else if (
          !script.type ||
          ['text/javascript', 'application/javascript', 'application/ecmascript'].includes(
            script.type
          )
        ) {
          if (scriptsRun.includes(script.innerText)) {
            continue;
          }

          try {
            scriptsRun.push(script.innerText);
            new Function(script.innerText)();
          } catch (error) {
            console.warn('`Embed`: Error running script:', error);
          }
        }
      }
    }
  }

  const elem = useRef();

  useEffect(() => {
    findAndRunScripts();
  }, []);

  return (
    <View
      className="builder-embed"
      ref={elem}
      dangerouslySetInnerHTML={{ __html: 'props.content' }}
    />
  );
}
