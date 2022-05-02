import { For } from "solid-js";
import { createMutable } from "solid-js/store";
import { css } from "solid-styled-components";
import RenderBlocks from "../components/render-blocks";

function Columns(props) {
  const state = createMutable({
    getGutterSize() {
      return typeof props.space === "number" ? props.space || 0 : 20;
    },

    getColumns() {
      return props.columns || [];
    },

    getWidth(index) {
      const columns = this.getColumns();
      return columns[index]?.width || 100 / columns.length;
    },

    getColumnCssWidth(index) {
      const columns = this.getColumns();
      const gutterSize = this.getGutterSize();
      const subtractWidth = gutterSize * (columns.length - 1) / columns.length;
      return `calc(${this.getWidth(index)}% - ${subtractWidth}px)`;
    },

    maybeApplyForTablet(prop) {
      const _stackColumnsAt = props.stackColumnsAt || "tablet";

      return _stackColumnsAt === "tablet" ? prop : "inherit";
    },

    get columnsCssVars() {
      const flexDir = props.stackColumnsAt === "never" ? "inherit" : props.reverseColumnsWhenStacked ? "column-reverse" : "column";
      return {
        "--flex-dir": flexDir,
        "--flex-dir-tablet": this.maybeApplyForTablet(flexDir)
      };
    },

    get columnCssVars() {
      const width = "100%";
      const marginLeft = "0";
      return {
        "--column-width": width,
        "--column-margin-left": marginLeft,
        "--column-width-tablet": this.maybeApplyForTablet(width),
        "--column-margin-left-tablet": this.maybeApplyForTablet(marginLeft)
      };
    }

  });
  return <div class={css({
    display: "flex",
    alignItems: "stretch",
    lineHeight: "normal",
    "@media (max-width: 999px)": {
      flexDirection: "var(--flex-dir-tablet)"
    },
    "@media (max-width: 639px)": {
      flexDirection: "var(--flex-dir)"
    }
  })} style={state.columnsCssVars}>
      <For each={props.columns}>
        {(column, _index) => {
        const index = _index();

        return <div class={css({
          flexGrow: "1",
          "@media (max-width: 999px)": {
            width: "var(--column-width-tablet) !important",
            marginLeft: "var(--column-margin-left-tablet) !important"
          },
          "@media (max-width: 639px)": {
            width: "var(--column-width) !important",
            marginLeft: "var(--column-margin-left) !important"
          }
        })} style={{
          width: state.getColumnCssWidth(index),
          "margin-left": `${index === 0 ? 0 : state.getGutterSize()}px`,
          ...state.columnCssVars
        }}>
              <RenderBlocks blocks={column.blocks}></RenderBlocks>
            </div>;
      }}
      </For>
    </div>;
}

export default Columns;import { registerComponent } from '../functions/register-component';
registerComponent(Columns, {name:'Columns',builtIn:true,inputs:[{name:'columns',type:'array',broadcast:true,subFields:[{name:'blocks',type:'array',hideFromUI:true,defaultValue:[{'@type':'@builder.io/sdk:Element',responsiveStyles:{large:{display:'flex',flexDirection:'column',alignItems:'stretch',flexShrink:'0',position:'relative',marginTop:'30px',textAlign:'center',lineHeight:'normal',height:'auto',minHeight:'20px',minWidth:'20px',overflow:'hidden'}},component:{name:'Image',options:{image:'https://builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',backgroundPosition:'center',backgroundSize:'cover',aspectRatio:0.7004048582995948}}},{'@type':'@builder.io/sdk:Element',responsiveStyles:{large:{display:'flex',flexDirection:'column',alignItems:'stretch',flexShrink:'0',position:'relative',marginTop:'30px',textAlign:'center',lineHeight:'normal',height:'auto'}},component:{name:'Text',options:{text:'<p>Enter some text...</p>'}}}]},{name:'width',type:'number',hideFromUI:true,helperText:'Width %, e.g. set to 50 to fill half of the space'},{name:'link',type:'url',helperText:'Optionally set a url that clicking this column will link to'}],defaultValue:[{blocks:[{'@type':'@builder.io/sdk:Element',responsiveStyles:{large:{display:'flex',flexDirection:'column',alignItems:'stretch',flexShrink:'0',position:'relative',marginTop:'30px',textAlign:'center',lineHeight:'normal',height:'auto',minHeight:'20px',minWidth:'20px',overflow:'hidden'}},component:{name:'Image',options:{image:'https://builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',backgroundPosition:'center',backgroundSize:'cover',aspectRatio:0.7004048582995948}}},{'@type':'@builder.io/sdk:Element',responsiveStyles:{large:{display:'flex',flexDirection:'column',alignItems:'stretch',flexShrink:'0',position:'relative',marginTop:'30px',textAlign:'center',lineHeight:'normal',height:'auto'}},component:{name:'Text',options:{text:'<p>Enter some text...</p>'}}}]},{blocks:[{'@type':'@builder.io/sdk:Element',responsiveStyles:{large:{display:'flex',flexDirection:'column',alignItems:'stretch',flexShrink:'0',position:'relative',marginTop:'30px',textAlign:'center',lineHeight:'normal',height:'auto',minHeight:'20px',minWidth:'20px',overflow:'hidden'}},component:{name:'Image',options:{image:'https://builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',backgroundPosition:'center',backgroundSize:'cover',aspectRatio:0.7004048582995948}}},{'@type':'@builder.io/sdk:Element',responsiveStyles:{large:{display:'flex',flexDirection:'column',alignItems:'stretch',flexShrink:'0',position:'relative',marginTop:'30px',textAlign:'center',lineHeight:'normal',height:'auto'}},component:{name:'Text',options:{text:'<p>Enter some text...</p>'}}}]}],onChange:"        function clearWidths() {          columns.forEach(col => {            col.delete('width');          });        }        const columns = options.get('columns') as Array<Map<String, any>>;        if (Array.isArray(columns)) {          const containsColumnWithWidth = !!columns.find(col => col.get('width'));          if (containsColumnWithWidth) {            const containsColumnWithoutWidth = !!columns.find(col => !col.get('width'));            if (containsColumnWithoutWidth) {              clearWidths();            } else {              const sumWidths = columns.reduce((memo, col) => {                return memo + col.get('width');              }, 0);              const widthsDontAddUp = sumWidths !== 100;              if (widthsDontAddUp) {                clearWidths();              }            }          }        }      "},{name:'space',type:'number',defaultValue:20,helperText:'Size of gap between columns',advanced:true},{name:'stackColumnsAt',type:'string',defaultValue:'tablet',helperText:'Convert horizontal columns to vertical at what device size',enum:['tablet','mobile','never'],advanced:true},{name:'reverseColumnsWhenStacked',type:'boolean',defaultValue:false,helperText:'When stacking columns for mobile devices, reverse the ordering',advanced:true}]});