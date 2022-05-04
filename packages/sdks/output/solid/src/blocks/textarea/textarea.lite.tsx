function Textarea(props) {
  return (
    <textarea
      {...props.attributes}
      placeholder={props.placeholder}
      name={props.name}
      value={props.value}
      defaultValue={props.defaultValue}
    ></textarea>
  );
}

export default Textarea;
