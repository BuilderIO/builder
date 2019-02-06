declare module 'virtual-dom/vnode/vnode' {
  interface VNodeConstructor {
    new (
      tagName: string,
      properties: VirtualDOM.VProperties,
      children: VirtualDOM.VTree[],
      notSure?: any,
      namespace?: string | null
    ): VirtualDOM.VNode;
  }

  const _export: VNodeConstructor;
  export default _export;
}

declare module 'virtual-dom/vnode/vtext' {
  interface VTextConstructor {
    new (text?: string | null): VirtualDOM.VText;
  }

  const _export: VTextConstructor;
  export default _export;
}
