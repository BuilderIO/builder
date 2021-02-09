export interface Variant {
  id: any;
  product_id: any;
  title: string;
  price: string;
  sku: string;
  position: number;
  compare_at_price: string;
  fulfillment_service: string;
  inventory_management: string;
  option1: string;
  option2?: string;
  option3?: any;
  created_at: Date;
  updated_at: Date;
  taxable: boolean;
  barcode: string;
  grams: number;
  image_id: any;
  weight: number;
  weight_unit: string;
  requires_shipping: boolean;
  featured_image?: Image;
}

export interface Option {
  id: any;
  product_id: any;
  name: string;
  position: number;
  values: string[];
}

export interface Image {
  id: any;
  product_id: any;
  position: number;
  created_at: Date;
  updated_at: Date;
  alt?: any;
  width: number;
  height: number;
  src: string;
  variant_ids: any[];
}

export interface Image2 {
  id: number;
  product_id: number;
  position: number;
  created_at: Date;
  updated_at: Date;
  alt?: any;
  width: number;
  height: number;
  src: string;
  variant_ids: any[];
}

export interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: Date;
  handle: string;
  updated_at: Date;
  published_at: Date;
  template_suffix: string;
  published_scope: string;
  description: string;
  tags: string;
  variants: Variant[];
  options: Option[];
  images: Image[];
  image: Image2;
}
