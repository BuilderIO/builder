import { BuilderBlock } from '../types/builder-block';
import { View } from 'react-native';

export function getBlockTag(block: BuilderBlock) {
  // TODO: logic for TouchableView etc
  return View;
}
