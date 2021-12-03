import { sizes } from '../constants/device-sizes';
import { BuilderBlock } from '../types/builder-block';

const camelCaseToDashCase = (str = '') =>
  str.replace(/[A-Z]/g, (match) => '-' + match.toLowerCase());

const convertStyleObject = (obj: Record<string, string>) => {
  if (!obj) {
    return obj;
  }
  const newObj = {};
  for (const key in obj) {
    newObj[camelCaseToDashCase(key)] = obj[key];
  }
  return newObj;
};

export function getBlockStyles(block: BuilderBlock) {
  const styles: any = {
    ...convertStyleObject(block.responsiveStyles?.large),
  };

  if (block.responsiveStyles?.medium) {
    styles[`@media (max-width: ${sizes.medium})`] = convertStyleObject(
      block.responsiveStyles?.medium
    );
  }
  if (block.responsiveStyles?.small) {
    styles[`@media (max-width: ${sizes.small})`] = convertStyleObject(
      block.responsiveStyles?.small
    );
  }

  return styles;
}
