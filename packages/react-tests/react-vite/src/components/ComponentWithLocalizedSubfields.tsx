export const ComponentWithLocalizedSubfields = (props: {
  texts: { text1: string; text2: string }[];
}) => {
  return (
    <div>
      {props.texts?.map((text, index) => (
        <div key={index}>
          {text.text1}
          <br />
          {text.text2}
        </div>
      ))}
    </div>
  );
};
