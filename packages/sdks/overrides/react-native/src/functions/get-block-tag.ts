import { View } from 'react-native';
import type { BuilderBlock } from '../types/builder-block.js';

export function getBlockTag(_block: BuilderBlock) {
  // TODO: logic for TouchableView etc
  return View;
}
