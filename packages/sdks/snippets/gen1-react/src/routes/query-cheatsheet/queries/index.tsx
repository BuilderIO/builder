import { getProduct as $and } from './and';
import { getProduct as $elemMatch } from './elemMatch';
import { getProduct as $eq } from './eq';
import { getProduct as $exists } from './exists';
import { getProduct as $gt } from './gt';
import { getProduct as $gte } from './gte';
import { getProduct as $in } from './in';
import { getProduct as $lt } from './lt';
import { getProduct as $lte } from './lte';
import { getProduct as $ne } from './ne';
import { getProduct as $nin } from './nin';
import { getProduct as $nor } from './nor';
import { getProduct as $not } from './not';
import { getProduct as $options } from './options';
import { getProduct as $or } from './or';
import { getProduct as $regex } from './regex';
import { getProduct as $type } from './type';

export default {
  $eq,
  $gt,
  $gte,
  $in,
  $lt,
  $lte,
  $ne,
  $nin,
  $and,
  $not,
  $or,
  $nor,
  $exists,
  $type,
  $regex,
  $elemMatch,
  $options,
};
