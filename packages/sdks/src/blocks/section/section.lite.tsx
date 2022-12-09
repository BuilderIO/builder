export interface SectionProps {
  maxWidth?: number;
  attributes?: any;
  children?: any;
  builderBlock?: any;
}

export default function SectionComponent(props: SectionProps) {
  return (
    <section
      {...props.attributes}
      style={{
        width: '100%',
        alignSelf: 'stretch',
        flexGrow: '1',
        boxSizing: 'border-box',
        maxWidth: `${
          props.maxWidth && typeof props.maxWidth === 'number'
            ? props.maxWidth
            : 1200
        }px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      {props.children}
    </section>
  );
}
