function Hello(props: { context?: any }) {
  return <div>hello {props.context?.builderContent?.data?.title || 'World'}</div>;
}

export default Hello;
