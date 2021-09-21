export interface Image {
  width?: number;
  height?: number;
  src: string;
}

export interface Resource {
  id: string | number;
  title: string;
  handle?: string;
  image?: Image;
}
