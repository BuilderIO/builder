import * as React from "react";
import {
  FlatList,
  ScrollView,
  View,
  StyleSheet,
  Image,
  Text,
} from "react-native";
import { useState, useRef, useEffect } from "react";

function CustomCode(props) {
  const elem = useRef(null);
  const [scriptsInserted, setScriptsInserted] = useState(() => []);

  const [scriptsRun, setScriptsRun] = useState(() => []);

  function findAndRunScripts() {
    // TODO: Move this function to standalone one in '@builder.io/utils'
    if (
      elem.current &&
      elem.current.getElementsByTagName &&
      typeof window !== "undefined"
    ) {
      const scripts = elem.current.getElementsByTagName("script");
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        if (script.src) {
          if (scriptsInserted.includes(script.src)) {
            continue;
          }
          scriptsInserted.push(script.src);
          const newScript = document.createElement("script");
          newScript.async = true;
          newScript.src = script.src;
          document.head.appendChild(newScript);
        } else if (
          !script.type ||
          [
            "text/javascript",
            "application/javascript",
            "application/ecmascript",
          ].includes(script.type)
        ) {
          if (scriptsRun.includes(script.innerText)) {
            continue;
          }
          try {
            scriptsRun.push(script.innerText);
            new Function(script.innerText)();
          } catch (error) {
            console.warn("`CustomCode`: Error running script:", error);
          }
        }
      }
    }
  }

  useEffect(() => {
    findAndRunScripts();
  }, []);

  return <View ref={elem} dangerouslySetInnerHTML={{ __html: props.code }} />;
}

export default CustomCode;
