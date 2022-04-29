import FragmentComponent from '../../blocks/fragment.lite';
import { registerComponent } from '../../functions/register-component';

registerComponent(FragmentComponent, {
  name: 'Fragment',
  static: true,
  hidden: true,
  builtIn: true,
  canHaveChildren: true,
  noWrap: true,
});
