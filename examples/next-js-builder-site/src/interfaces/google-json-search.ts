export interface GoogleSearchResponse {
  kind: string;
  url: Url;
  queries: Queries;
  context: Context;
  searchInformation: SearchInformation;
  items?: ItemsEntity[] | null;
}
export interface Url {
  type: string;
  template: string;
}
export interface Queries {
  request?: RequestEntityOrNextPageEntity[] | null;
  nextPage?: RequestEntityOrNextPageEntity[] | null;
}
export interface RequestEntityOrNextPageEntity {
  title: string;
  totalResults: string;
  searchTerms: string;
  count: number;
  startIndex: number;
  inputEncoding: string;
  outputEncoding: string;
  safe: string;
  cx: string;
}
export interface Context {
  title: string;
}
export interface SearchInformation {
  searchTime: number;
  formattedSearchTime: string;
  totalResults: string;
  formattedTotalResults: string;
}
export interface ItemsEntity {
  kind: string;
  title: string;
  htmlTitle: string;
  link: string;
  displayLink: string;
  snippet: string;
  htmlSnippet: string;
  cacheId: string;
  formattedUrl: string;
  htmlFormattedUrl: string;
  pagemap: Pagemap;
}
export interface Pagemap {
  cse_thumbnail?: CseThumbnailEntity[] | null;
  metatags?: MetatagsEntity[] | null;
  cse_image?: CseImageEntity[] | null;
  imageobject?: ImageobjectEntity[] | null;
  person?: PersonEntityOrSitenavigationelementEntity[] | null;
  organization?: OrganizationEntity[] | null;
  interactioncounter?: InteractioncounterEntity[] | null;
  discussionforumposting?: DiscussionforumpostingEntity[] | null;
  sitenavigationelement?: PersonEntityOrSitenavigationelementEntity[] | null;
  listitem?: ListitemEntity[] | null;
}
export interface CseThumbnailEntity {
  src: string;
  width: string;
  height: string;
}
export interface MetatagsEntity {
  [key: string]: string;
}
export interface CseImageEntity {
  src: string;
}
export interface ImageobjectEntity {
  url: string;
}
export interface PersonEntityOrSitenavigationelementEntity {
  name: string;
  url: string;
}
export interface OrganizationEntity {
  name: string;
}
export interface InteractioncounterEntity {
  userinteractioncount: string;
  interactiontype: string;
}
export interface DiscussionforumpostingEntity {
  articlebody: string;
  datemodified?: string | null;
  position: string;
  headline: string;
  datepublished: string;
  mainentityofpage?: string | null;
  image?: string | null;
}
export interface ListitemEntity {
  item: string;
  name: string;
  position: string;
}
