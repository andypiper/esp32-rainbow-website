import key0 from './key_images/0.png'
import key1 from './key_images/1.png'
import key2 from './key_images/2.png'
import key3 from './key_images/3.png'
import key4 from './key_images/4.png'
import key5 from './key_images/5.png'
import key6 from './key_images/6.png'
import key7 from './key_images/7.png'
import key8 from './key_images/8.png'
import key9 from './key_images/9.png'
import keyA from './key_images/a.png'
import keyB from './key_images/b.png'
import keyC from './key_images/c.png'
import keyD from './key_images/d.png'
import keyE from './key_images/e.png'
import keyF from './key_images/f.png'
import keyG from './key_images/g.png'
import keyH from './key_images/h.png'
import keyI from './key_images/i.png'
import keyJ from './key_images/j.png'
import keyK from './key_images/k.png'
import keyL from './key_images/l.png'
import keyM from './key_images/m.png'
import keyN from './key_images/n.png'
import keyO from './key_images/o.png'
import keyP from './key_images/p.png'
import keyQ from './key_images/q.png'
import keyR from './key_images/r.png'
import keyS from './key_images/s.png'
import keyT from './key_images/t.png'
import keyU from './key_images/u.png'
import keyV from './key_images/v.png'
import keyW from './key_images/w.png'
import keyX from './key_images/x.png'
import keyY from './key_images/y.png'
import keyZ from './key_images/z.png'
import keyShift from './key_images/shift.png'
import keySym from './key_images/sym.png'
import keySpace from './key_images/space.png'
import keyEnter from './key_images/enter.png'

interface Key {
  name: string;
  image: string;
}
// the ZX Spectrum keyboard is 8 x 5 keys
const keys: Key[][] = [
  [
    { name: '1', image: key1 },
    { name: '2', image: key2 },
    { name: '3', image: key3 },
    { name: '4', image: key4 },
    { name: '5', image: key5 },
    { name: '6', image: key6 },
    { name: '7', image: key7 },
    { name: '8', image: key8 },
    { name: '9', image: key9 },
    { name: '0', image: key0 },
  ],
  [
    { name: 'q', image: keyQ },
    { name: 'w', image: keyW },
    { name: 'e', image: keyE },
    { name: 'r', image: keyR },
    { name: 't', image: keyT },
    { name: 'y', image: keyY },
    { name: 'u', image: keyU },
    { name: 'i', image: keyI },
    { name: 'o', image: keyO },
    { name: 'p', image: keyP },
  ],
  [
    { name: 'a', image: keyA },
    { name: 's', image: keyS },
    { name: 'd', image: keyD },
    { name: 'f', image: keyF },
    { name: 'g', image: keyG },
    { name: 'h', image: keyH },
    { name: 'j', image: keyJ },
    { name: 'k', image: keyK },
    { name: 'l', image: keyL },
    { name: 'enter', image: keyEnter },
  ],
  [
    { name: 'shift', image: keyShift },
    { name: 'z', image: keyZ },
    { name: 'x', image: keyX },
    { name: 'c', image: keyC },
    { name: 'v', image: keyV },
    { name: 'b', image: keyB },
    { name: 'n', image: keyN },
    { name: 'm', image: keyM },
    { name: 'symb', image: keySym },
    { name: 'space', image: keySpace },
  ]
];

export default keys;