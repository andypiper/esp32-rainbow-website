export interface Game {
  i: number;  // id
  t: string;  // title
  g: string;  // genre
  m: string;  // machine
  sc: number; // score
  f: {        // files
    l: string;  // link
    y: string;  // type
    s: number | null;  // size (can be null)
  }[];
} 