export interface BuilderRequest {
  '@type': '@builder.io/core:Request';
  request: {
    url: string;
    query?: { [key: string]: string };
    headers?: { [key: string]: string };
    method?: string;
    body?: { [key: string]: any };
  };
  options?: { [key: string]: any };
  bindings?: { [key: string]: string };
}
