<script>
    
    
    
    
  import  RenderBlocks,  {  }  from '../components/render-blocks.lite';

  


    
    export let space;
export let columns;
export let stackColumnsAt;
export let reverseColumnsWhenStacked;

    function  getGutterSize() {
return typeof space === 'number' ? space || 0 : 20;
}
function  getColumns() {
return columns || [];
}
function  getWidth(index: number) {
const columns = this.getColumns();
return columns[index]?.width || 100 / columns.length;
}
function  getColumnCssWidth(index: number) {
const columns = this.getColumns();
const gutterSize = this.getGutterSize();
const subtractWidth = gutterSize * (columns.length - 1) / columns.length;
return `calc(${this.getWidth(index)}% - ${subtractWidth}px)`;
}
function  maybeApplyForTablet(prop: string) {
const stackColumnsAt = stackColumnsAt || 'tablet';
return stackColumnsAt === 'tablet' ? prop : 'inherit';
}

    $:  columnsCssVars = () =>  {
const flexDir = stackColumnsAt === 'never' ? 'inherit' : reverseColumnsWhenStacked ? 'column-reverse' : 'column';
return {
  '--flex-dir': flexDir,
  '--flex-dir-tablet': this.maybeApplyForTablet(flexDir)
};
}
$:  columnCssVars = () =>  {
const width = '100%';
const marginLeft = '0';
return {
  '--column-width': width,
  '--column-margin-left': marginLeft,
  '--column-width-tablet': this.maybeApplyForTablet(width),
  '--column-margin-left-tablet': this.maybeApplyForTablet(marginLeft)
};
}


    

    

    

    
  </script>

  <div  class="builder-columns div"  style={columnsCssVars()} >
    
{#each columns as column }<div  class="builder-column div-2"  style={{
width: getColumnCssWidth(index),
marginLeft: `${index === 0 ? 0 : getGutterSize()}px`,
...columnCssVars()
}} >
          
<RenderBlocks  blocks={column.blocks} ></RenderBlocks>

        </div>{/each}

  </div>

  <style>
    .div { 
display: flex;
align-items: stretch;
line-height: normal; }@media (max-width: 999px) { .div { 
flex-direction: var(--flex-dir-tablet); } }@media (max-width: 639px) { .div { 
flex-direction: var(--flex-dir); } }.div-2 { 
flex-grow: 1; }@media (max-width: 999px) { .div-2 { 
width: var(--column-width-tablet) !important;
margin-left: var(--column-margin-left-tablet) !important; } }@media (max-width: 639px) { .div-2 { 
width: var(--column-width) !important;
margin-left: var(--column-margin-left) !important; } }
  </style>