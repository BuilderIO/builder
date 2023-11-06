import { filterAttrs } from "../helpers.js";

function SubmitButton(props) {
  return (
    <button type="submit" {...{}} {...props.attributes}>
      {props.text}
    </button>
  );
}

export default SubmitButton;
