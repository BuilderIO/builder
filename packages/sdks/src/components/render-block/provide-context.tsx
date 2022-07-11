import { setContext } from '@builder.io/mitosis';
import { JSX } from '@builder.io/mitosis/jsx-runtime';
import BuilderContext, {
  BuilderContextInterface,
} from '../../context/builder.context.lite';

type Props = {
  children: JSX.Element;
  repeatContext: BuilderContextInterface;
};

export default function RepeatRenderComponent(props: Props) {
  setContext(BuilderContext, {
    get content() {
      return props.repeatContext.content;
    },
    get state() {
      return props.repeatContext.state;
    },
    get context() {
      return props.repeatContext.context;
    },
    get apiKey() {
      return props.repeatContext.apiKey;
    },
    get registeredComponents() {
      return props.repeatContext.registeredComponents;
    },
  });

  return props.children;
}
