import { createMutable } from "solid-js/store";

function Embed(props) {
  const state = createMutable({
    scriptsInserted: [],
    scriptsRun: [],

    findAndRunScripts() {
      // TODO: Move this function to standalone one in '@builder.io/utils'
      if (elem && typeof window !== "undefined") {
        /** @type {HTMLScriptElement[]} */
        const scripts = elem.getElementsByTagName("script");

        for (let i = 0; i < scripts.length; i++) {
          const script = scripts[i];

          if (script.src) {
            if (state.scriptsInserted.includes(script.src)) {
              continue;
            }

            state.scriptsInserted.push(script.src);
            const newScript = document.createElement("script");
            newScript.async = true;
            newScript.src = script.src;
            document.head.appendChild(newScript);
          } else if (!script.type || ["text/javascript", "application/javascript", "application/ecmascript"].includes(script.type)) {
            if (state.scriptsRun.includes(script.innerText)) {
              continue;
            }

            try {
              state.scriptsRun.push(script.innerText);
              new Function(script.innerText)();
            } catch (error) {
              console.warn("`Embed`: Error running script:", error);
            }
          }
        }
      }
    }

  });
  const elem = useRef();
  onMount(() => {
    state.findAndRunScripts();
  });
  return <div ref={elem} innerHTML={props.content}></div>;
}

export default Embed;import { registerComponent } from '../functions/register-component';
registerComponent(Embed, {name:'Embed',static:true,builtIn:true,inputs:[{name:'url',type:'url',required:true,defaultValue:'',helperText:'e.g. enter a youtube url, google map, etc',onChange:"        const url = options.get('url');        if (url) {          options.set('content', 'Loading...');          // TODO: get this out of here!          const apiKey = 'ae0e60e78201a3f2b0de4b';          return fetch(`https://iframe.ly/api/iframely?url=${url}&api_key=${apiKey}`)            .then(res => res.json())            .then(data => {              if (options.get('url') === url) {                if (data.html) {                  options.set('content', data.html);                } else {                  options.set('content', 'Invalid url, please try another');                }              }            })            .catch(err => {              options.set(                'content',                'There was an error embedding this URL, please try again or another URL'              );            });        } else {          options.delete('content');        }      "},{name:'content',type:'html',defaultValue:'<div style="padding: 20px; text-align: center">(Choose an embed URL)<div>',hideFromUI:true}]});