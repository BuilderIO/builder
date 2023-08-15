import { useContext } from '@builder.io/mitosis';
import BuilderContext from '../context/builder.context.lite.js';

/**
 * NO-OP placeholder for react-native BaseText implementation
 */
export default function BaseText(props: { text: string }) {
  const builderContext = useContext(BuilderContext);
  return (
    <span style={builderContext.value.inheritedStyles as any}>
      {props.text}
    </span>
  );
}
