export default function SubmitButton(props) {
  return (
    <button {...props.attributes} type="submit">
      {props.text}
    </button>
  );
}
