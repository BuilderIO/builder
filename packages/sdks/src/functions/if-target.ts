type Target = import('../types/targets').Target;
import { TARGET } from '../constants/target';

// TODO: babel compile to include certain code only if the target matches
export function ifTarget<A, B>({
  targets,
  doThing,
  elseThing,
}: {
  targets: Target[];
  doThing: () => A;
  elseThing?: () => B;
}) {
  if (TARGET && targets.includes(TARGET)) {
    return doThing();
  } else {
    return elseThing?.();
  }
}
