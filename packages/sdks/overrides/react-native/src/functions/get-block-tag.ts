import type { BuilderBlock } from '../types/builder-block.js';
import { View } from 'react-native';

export function getBlockTag(_block: BuilderBlock) {
  // TODO: logic for TouchableView etc
  return View;
}
