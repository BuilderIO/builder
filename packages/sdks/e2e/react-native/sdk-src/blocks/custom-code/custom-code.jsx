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
  const elementRef = useRef(null);
  const [scriptsInserted, setScriptsInserted] = useState(() => []);

  const [scriptsRun, setScriptsRun] = useState(() => []);

  useEffect(() => {
    // TODO: Move this function to standalone one in '@builder.io/utils'
    if (
      !elementRef.current?.getElementsByTagName ||
      typeof window === "undefined"
    ) {
      return;
    }
    const scripts = elementRef.current.getElementsByTagName("script");
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
  }, []);

  return (
    <View ref={elementRef} dangerouslySetInnerHTML={{ __html: props.code }} />
  );
}

export default CustomCode;
