import { Quill } from 'react-quill'

const sizes = [
  '10px',
  '12px',
  '14px',
  '16px',
  '18px',
  '20px',
  '22px',
  '24px',
  '26px',
  '28px',
  '30px',
  '32px',
  '34px',
  '36px',
  '38px',
  '40px',
  '42px',
  '44px',
  '46px',
  '48px',
  '50px',
  '52px',
  '54px',
  '56px',
  '58px',
  '60px',
]
const Size = Quill.import('attributors/style/size')
Size.whitelist = sizes

export { Size }
