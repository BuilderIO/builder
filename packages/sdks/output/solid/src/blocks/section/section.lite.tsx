function SectionComponent(props) {
  return (
    <section
      {...props.attributes}
      style={
        props.maxWidth && typeof props.maxWidth === "number"
          ? {
              "max-width": props.maxWidth,
            }
          : undefined
      }
    >
      {props.children}
    </section>
  );
}

export default SectionComponent;
