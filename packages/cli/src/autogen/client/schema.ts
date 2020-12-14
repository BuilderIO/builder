import { Observable } from 'graphql-typed-client'

export interface Query {
  /** Get all the models */
  models: ModelType[] | null
  /** Get specific model by id */
  model: ModelType | null
  id: String
  settings: JSONObject
  downloadClone: SpaceType
  __typename: 'Query'
}

export interface ModelType {
  id: ID | null
  designerVersion: Int | null
  name: String
  kind: String
  subType: String | null
  examplePageUrl: String | null
  helperText: String | null
  nameField: String | null
  pathPrefix: String | null
  injectWcAt: String | null
  injectWcPosition: String | null
  lastUpdateBy: String | null
  repeatable: Boolean | null
  autoTracked: Boolean | null
  singleton: Boolean | null
  hideOptions: Boolean | null
  hidden: Boolean | null
  getSchemaFromPage: Boolean | null
  archived: Boolean | null
  individualEmbed: Boolean | null
  componentsOnlyMode: Boolean | null
  bigData: Boolean | null
  isPage: Boolean | null
  clientSideOnly: Boolean | null
  shopifyUseMetafieldsForContent: Boolean | null
  shopifyDoNotUsePreviewTemplates: Boolean | null
  sendToElasticSearch: Boolean | null
  sendToMongoDb: Boolean | null
  allowMetrics: Boolean | null
  allowTests: Boolean | null
  allowHeatmap: Boolean | null
  publicWritable: Boolean | null
  publicReadable: Boolean | null
  strictPrivateRead: Boolean | null
  strictPrivateWrite: Boolean | null
  showMetrics: Boolean | null
  showAbTests: Boolean | null
  showTargeting: Boolean | null
  showScheduling: Boolean | null
  schema: JSONObject | null
  hooks: JSONObject | null
  webhooks: JSONObject[] | null
  fields: JSONObject[] | null
  defaultQuery: QueryType[] | null
  requiredTargets: String[] | null
  content: JSONObject[]
  everything: JSONObject
  __typename: 'ModelType'
}

/** The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID. */
export type ID = string

/** The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1. */
export type Int = number

/** The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text. */
export type String = string

/** The `Boolean` scalar type represents `true` or `false`. */
export type Boolean = boolean

/** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
export type JSONObject = any

export interface QueryType {
  property: String | null
  operator: String
  value: JSON
  __typename: 'QueryType'
}

/** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
export type JSON = any

/** The `Float` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point). */
export type Float = number

export interface SpaceType {
  settings: JSONObject
  meta: JSONObject
  models: ModelWithContent[]
  __typename: 'SpaceType'
}

export interface ModelWithContent {
  id: ID | null
  designerVersion: Int | null
  name: String
  kind: String
  subType: String | null
  examplePageUrl: String | null
  helperText: String | null
  nameField: String | null
  pathPrefix: String | null
  injectWcAt: String | null
  injectWcPosition: String | null
  lastUpdateBy: String | null
  repeatable: Boolean | null
  autoTracked: Boolean | null
  singleton: Boolean | null
  hideOptions: Boolean | null
  hidden: Boolean | null
  getSchemaFromPage: Boolean | null
  archived: Boolean | null
  individualEmbed: Boolean | null
  componentsOnlyMode: Boolean | null
  bigData: Boolean | null
  isPage: Boolean | null
  clientSideOnly: Boolean | null
  shopifyUseMetafieldsForContent: Boolean | null
  shopifyDoNotUsePreviewTemplates: Boolean | null
  sendToElasticSearch: Boolean | null
  sendToMongoDb: Boolean | null
  allowMetrics: Boolean | null
  allowTests: Boolean | null
  allowHeatmap: Boolean | null
  publicWritable: Boolean | null
  publicReadable: Boolean | null
  strictPrivateRead: Boolean | null
  strictPrivateWrite: Boolean | null
  showMetrics: Boolean | null
  showAbTests: Boolean | null
  showTargeting: Boolean | null
  showScheduling: Boolean | null
  schema: JSONObject | null
  hooks: JSONObject | null
  webhooks: JSONObject[] | null
  fields: JSONObject[] | null
  defaultQuery: QueryType[] | null
  requiredTargets: String[] | null
  content: JSONObject[]
  everything: JSONObject
  __typename: 'ModelWithContent'
}

export interface Mutation {
  /** Create model */
  addModel: ModelType | null
  /** Update model */
  updateModel: ModelType | null
  /** Delete model */
  deleteModel: ModelType | null
  /**  Create a space on a parent organization with the provided settings, requires a private key of the root organization in auth headers, returns a private key of the newly created space */
  createSpace: JSONObject
  __typename: 'Mutation'
}

export interface QueryRequest {
  /** Get all the models */
  models?: ModelTypeRequest
  /** Get specific model by id */
  model?: [{ id: String }, ModelTypeRequest]
  id?: boolean | number
  settings?: boolean | number
  downloadClone?: [{ contentQuery?: ContentQuery | null }, SpaceTypeRequest] | SpaceTypeRequest
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface ModelTypeRequest {
  id?: boolean | number
  designerVersion?: boolean | number
  name?: boolean | number
  kind?: boolean | number
  subType?: boolean | number
  examplePageUrl?: boolean | number
  helperText?: boolean | number
  nameField?: boolean | number
  pathPrefix?: boolean | number
  injectWcAt?: boolean | number
  injectWcPosition?: boolean | number
  lastUpdateBy?: boolean | number
  repeatable?: boolean | number
  autoTracked?: boolean | number
  singleton?: boolean | number
  hideOptions?: boolean | number
  hidden?: boolean | number
  getSchemaFromPage?: boolean | number
  archived?: boolean | number
  individualEmbed?: boolean | number
  componentsOnlyMode?: boolean | number
  bigData?: boolean | number
  isPage?: boolean | number
  clientSideOnly?: boolean | number
  shopifyUseMetafieldsForContent?: boolean | number
  shopifyDoNotUsePreviewTemplates?: boolean | number
  sendToElasticSearch?: boolean | number
  sendToMongoDb?: boolean | number
  allowMetrics?: boolean | number
  allowTests?: boolean | number
  allowHeatmap?: boolean | number
  publicWritable?: boolean | number
  publicReadable?: boolean | number
  strictPrivateRead?: boolean | number
  strictPrivateWrite?: boolean | number
  showMetrics?: boolean | number
  showAbTests?: boolean | number
  showTargeting?: boolean | number
  showScheduling?: boolean | number
  schema?: boolean | number
  hooks?: boolean | number
  webhooks?: boolean | number
  fields?: boolean | number
  defaultQuery?: QueryTypeRequest
  requiredTargets?: boolean | number
  content?: [{ contentQuery?: ContentQuery | null }] | boolean | number
  everything?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface QueryTypeRequest {
  property?: boolean | number
  operator?: boolean | number
  value?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface ContentQuery {
  /** Limit results returned, e.g. `limit: 10, offset: 10` */
  limit?: Float | null
  /** Offset results returned, e.g. `limit: 10, offset: 10` */
  offset?: Float | null
  /** Filter results via mongodb queries. e.g. `query: { id: "abc123", data: { customNumberField: { $lt: 100 } } } */
  query?: JSONObject | null
  /** Pass targeting info, like target: { urlPath: '/foobar', device: 'mobile' } */
  target?: JSONObject | null
  /** Additional API options, e.g. `options: { includeUnpublished: true }` */
  options?: JSONObject | null
  /** Order results, e.g. `sort: { createdDate: -1 } */
  sort?: JSONObject | null
}

export interface SpaceTypeRequest {
  settings?: boolean | number
  meta?: boolean | number
  models?: ModelWithContentRequest
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface ModelWithContentRequest {
  id?: boolean | number
  designerVersion?: boolean | number
  name?: boolean | number
  kind?: boolean | number
  subType?: boolean | number
  examplePageUrl?: boolean | number
  helperText?: boolean | number
  nameField?: boolean | number
  pathPrefix?: boolean | number
  injectWcAt?: boolean | number
  injectWcPosition?: boolean | number
  lastUpdateBy?: boolean | number
  repeatable?: boolean | number
  autoTracked?: boolean | number
  singleton?: boolean | number
  hideOptions?: boolean | number
  hidden?: boolean | number
  getSchemaFromPage?: boolean | number
  archived?: boolean | number
  individualEmbed?: boolean | number
  componentsOnlyMode?: boolean | number
  bigData?: boolean | number
  isPage?: boolean | number
  clientSideOnly?: boolean | number
  shopifyUseMetafieldsForContent?: boolean | number
  shopifyDoNotUsePreviewTemplates?: boolean | number
  sendToElasticSearch?: boolean | number
  sendToMongoDb?: boolean | number
  allowMetrics?: boolean | number
  allowTests?: boolean | number
  allowHeatmap?: boolean | number
  publicWritable?: boolean | number
  publicReadable?: boolean | number
  strictPrivateRead?: boolean | number
  strictPrivateWrite?: boolean | number
  showMetrics?: boolean | number
  showAbTests?: boolean | number
  showTargeting?: boolean | number
  showScheduling?: boolean | number
  schema?: boolean | number
  hooks?: boolean | number
  webhooks?: boolean | number
  fields?: boolean | number
  defaultQuery?: QueryTypeRequest
  requiredTargets?: boolean | number
  content?: boolean | number
  everything?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface MutationRequest {
  /** Create model */
  addModel?: [{ body: JSONObject }, ModelTypeRequest]
  /** Update model */
  updateModel?: [{ body: UpdateModelInput }, ModelTypeRequest]
  /** Delete model */
  deleteModel?: [{ id: String }, ModelTypeRequest]
  /**  Create a space on a parent organization with the provided settings, requires a private key of the root organization in auth headers, returns a private key of the newly created space */
  createSpace?: [{ settings: JSONObject }]
  __typename?: boolean | number
  __scalar?: boolean | number
}

/** Update Model data, dotted paths in data */
export interface UpdateModelInput {
  id: String
  data: JSONObject
}

const Query_possibleTypes = ['Query']
export const isQuery = (obj: { __typename: String }): obj is Query => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return Query_possibleTypes.includes(obj.__typename)
}

const ModelType_possibleTypes = ['ModelType']
export const isModelType = (obj: { __typename: String }): obj is ModelType => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return ModelType_possibleTypes.includes(obj.__typename)
}

const QueryType_possibleTypes = ['QueryType']
export const isQueryType = (obj: { __typename: String }): obj is QueryType => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return QueryType_possibleTypes.includes(obj.__typename)
}

const SpaceType_possibleTypes = ['SpaceType']
export const isSpaceType = (obj: { __typename: String }): obj is SpaceType => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return SpaceType_possibleTypes.includes(obj.__typename)
}

const ModelWithContent_possibleTypes = ['ModelWithContent']
export const isModelWithContent = (obj: { __typename: String }): obj is ModelWithContent => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return ModelWithContent_possibleTypes.includes(obj.__typename)
}

const Mutation_possibleTypes = ['Mutation']
export const isMutation = (obj: { __typename: String }): obj is Mutation => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return Mutation_possibleTypes.includes(obj.__typename)
}

export interface QueryPromiseChain {
  /** Get all the models */
  models: { execute: (request: ModelTypeRequest, defaultValue?: ModelType[] | null) => Promise<ModelType[] | null> }
  /** Get specific model by id */
  model: (args: {
    id: String
  }) => ModelTypePromiseChain & {
    execute: (request: ModelTypeRequest, defaultValue?: ModelType | null) => Promise<ModelType | null>
  }
  id: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  settings: { execute: (request?: boolean | number, defaultValue?: JSONObject) => Promise<JSONObject> }
  downloadClone: ((args?: {
    contentQuery?: ContentQuery | null
  }) => SpaceTypePromiseChain & { execute: (request: SpaceTypeRequest, defaultValue?: SpaceType) => Promise<SpaceType> }) &
    (SpaceTypePromiseChain & { execute: (request: SpaceTypeRequest, defaultValue?: SpaceType) => Promise<SpaceType> })
}

export interface QueryObservableChain {
  /** Get all the models */
  models: { execute: (request: ModelTypeRequest, defaultValue?: ModelType[] | null) => Observable<ModelType[] | null> }
  /** Get specific model by id */
  model: (args: {
    id: String
  }) => ModelTypeObservableChain & {
    execute: (request: ModelTypeRequest, defaultValue?: ModelType | null) => Observable<ModelType | null>
  }
  id: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  settings: { execute: (request?: boolean | number, defaultValue?: JSONObject) => Observable<JSONObject> }
  downloadClone: ((args?: {
    contentQuery?: ContentQuery | null
  }) => SpaceTypeObservableChain & {
    execute: (request: SpaceTypeRequest, defaultValue?: SpaceType) => Observable<SpaceType>
  }) &
    (SpaceTypeObservableChain & { execute: (request: SpaceTypeRequest, defaultValue?: SpaceType) => Observable<SpaceType> })
}

export interface ModelTypePromiseChain {
  id: { execute: (request?: boolean | number, defaultValue?: ID | null) => Promise<ID | null> }
  designerVersion: { execute: (request?: boolean | number, defaultValue?: Int | null) => Promise<Int | null> }
  name: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  kind: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  subType: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  examplePageUrl: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  helperText: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  nameField: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  pathPrefix: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  injectWcAt: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  injectWcPosition: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  lastUpdateBy: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  repeatable: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  autoTracked: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  singleton: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  hideOptions: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  hidden: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  getSchemaFromPage: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  archived: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  individualEmbed: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  componentsOnlyMode: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  bigData: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  isPage: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  clientSideOnly: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  shopifyUseMetafieldsForContent: {
    execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null>
  }
  shopifyDoNotUsePreviewTemplates: {
    execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null>
  }
  sendToElasticSearch: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  sendToMongoDb: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  allowMetrics: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  allowTests: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  allowHeatmap: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  publicWritable: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  publicReadable: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  strictPrivateRead: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  strictPrivateWrite: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  showMetrics: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  showAbTests: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  showTargeting: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  showScheduling: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  schema: { execute: (request?: boolean | number, defaultValue?: JSONObject | null) => Promise<JSONObject | null> }
  hooks: { execute: (request?: boolean | number, defaultValue?: JSONObject | null) => Promise<JSONObject | null> }
  webhooks: { execute: (request?: boolean | number, defaultValue?: JSONObject[] | null) => Promise<JSONObject[] | null> }
  fields: { execute: (request?: boolean | number, defaultValue?: JSONObject[] | null) => Promise<JSONObject[] | null> }
  defaultQuery: { execute: (request: QueryTypeRequest, defaultValue?: QueryType[] | null) => Promise<QueryType[] | null> }
  requiredTargets: { execute: (request?: boolean | number, defaultValue?: String[] | null) => Promise<String[] | null> }
  content: ((args?: {
    contentQuery?: ContentQuery | null
  }) => { execute: (request?: boolean | number, defaultValue?: JSONObject[]) => Promise<JSONObject[]> }) & {
    execute: (request?: boolean | number, defaultValue?: JSONObject[]) => Promise<JSONObject[]>
  }
  everything: { execute: (request?: boolean | number, defaultValue?: JSONObject) => Promise<JSONObject> }
}

export interface ModelTypeObservableChain {
  id: { execute: (request?: boolean | number, defaultValue?: ID | null) => Observable<ID | null> }
  designerVersion: { execute: (request?: boolean | number, defaultValue?: Int | null) => Observable<Int | null> }
  name: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  kind: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  subType: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  examplePageUrl: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  helperText: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  nameField: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  pathPrefix: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  injectWcAt: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  injectWcPosition: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  lastUpdateBy: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  repeatable: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  autoTracked: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  singleton: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  hideOptions: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  hidden: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  getSchemaFromPage: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  archived: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  individualEmbed: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  componentsOnlyMode: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  bigData: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  isPage: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  clientSideOnly: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  shopifyUseMetafieldsForContent: {
    execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null>
  }
  shopifyDoNotUsePreviewTemplates: {
    execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null>
  }
  sendToElasticSearch: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  sendToMongoDb: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  allowMetrics: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  allowTests: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  allowHeatmap: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  publicWritable: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  publicReadable: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  strictPrivateRead: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  strictPrivateWrite: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  showMetrics: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  showAbTests: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  showTargeting: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  showScheduling: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  schema: { execute: (request?: boolean | number, defaultValue?: JSONObject | null) => Observable<JSONObject | null> }
  hooks: { execute: (request?: boolean | number, defaultValue?: JSONObject | null) => Observable<JSONObject | null> }
  webhooks: { execute: (request?: boolean | number, defaultValue?: JSONObject[] | null) => Observable<JSONObject[] | null> }
  fields: { execute: (request?: boolean | number, defaultValue?: JSONObject[] | null) => Observable<JSONObject[] | null> }
  defaultQuery: { execute: (request: QueryTypeRequest, defaultValue?: QueryType[] | null) => Observable<QueryType[] | null> }
  requiredTargets: { execute: (request?: boolean | number, defaultValue?: String[] | null) => Observable<String[] | null> }
  content: ((args?: {
    contentQuery?: ContentQuery | null
  }) => { execute: (request?: boolean | number, defaultValue?: JSONObject[]) => Observable<JSONObject[]> }) & {
    execute: (request?: boolean | number, defaultValue?: JSONObject[]) => Observable<JSONObject[]>
  }
  everything: { execute: (request?: boolean | number, defaultValue?: JSONObject) => Observable<JSONObject> }
}

export interface QueryTypePromiseChain {
  property: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  operator: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  value: { execute: (request?: boolean | number, defaultValue?: JSON) => Promise<JSON> }
}

export interface QueryTypeObservableChain {
  property: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  operator: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  value: { execute: (request?: boolean | number, defaultValue?: JSON) => Observable<JSON> }
}

export interface SpaceTypePromiseChain {
  settings: { execute: (request?: boolean | number, defaultValue?: JSONObject) => Promise<JSONObject> }
  meta: { execute: (request?: boolean | number, defaultValue?: JSONObject) => Promise<JSONObject> }
  models: { execute: (request: ModelWithContentRequest, defaultValue?: ModelWithContent[]) => Promise<ModelWithContent[]> }
}

export interface SpaceTypeObservableChain {
  settings: { execute: (request?: boolean | number, defaultValue?: JSONObject) => Observable<JSONObject> }
  meta: { execute: (request?: boolean | number, defaultValue?: JSONObject) => Observable<JSONObject> }
  models: {
    execute: (request: ModelWithContentRequest, defaultValue?: ModelWithContent[]) => Observable<ModelWithContent[]>
  }
}

export interface ModelWithContentPromiseChain {
  id: { execute: (request?: boolean | number, defaultValue?: ID | null) => Promise<ID | null> }
  designerVersion: { execute: (request?: boolean | number, defaultValue?: Int | null) => Promise<Int | null> }
  name: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  kind: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  subType: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  examplePageUrl: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  helperText: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  nameField: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  pathPrefix: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  injectWcAt: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  injectWcPosition: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  lastUpdateBy: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  repeatable: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  autoTracked: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  singleton: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  hideOptions: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  hidden: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  getSchemaFromPage: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  archived: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  individualEmbed: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  componentsOnlyMode: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  bigData: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  isPage: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  clientSideOnly: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  shopifyUseMetafieldsForContent: {
    execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null>
  }
  shopifyDoNotUsePreviewTemplates: {
    execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null>
  }
  sendToElasticSearch: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  sendToMongoDb: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  allowMetrics: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  allowTests: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  allowHeatmap: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  publicWritable: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  publicReadable: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  strictPrivateRead: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  strictPrivateWrite: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  showMetrics: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  showAbTests: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  showTargeting: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  showScheduling: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  schema: { execute: (request?: boolean | number, defaultValue?: JSONObject | null) => Promise<JSONObject | null> }
  hooks: { execute: (request?: boolean | number, defaultValue?: JSONObject | null) => Promise<JSONObject | null> }
  webhooks: { execute: (request?: boolean | number, defaultValue?: JSONObject[] | null) => Promise<JSONObject[] | null> }
  fields: { execute: (request?: boolean | number, defaultValue?: JSONObject[] | null) => Promise<JSONObject[] | null> }
  defaultQuery: { execute: (request: QueryTypeRequest, defaultValue?: QueryType[] | null) => Promise<QueryType[] | null> }
  requiredTargets: { execute: (request?: boolean | number, defaultValue?: String[] | null) => Promise<String[] | null> }
  content: { execute: (request?: boolean | number, defaultValue?: JSONObject[]) => Promise<JSONObject[]> }
  everything: { execute: (request?: boolean | number, defaultValue?: JSONObject) => Promise<JSONObject> }
}

export interface ModelWithContentObservableChain {
  id: { execute: (request?: boolean | number, defaultValue?: ID | null) => Observable<ID | null> }
  designerVersion: { execute: (request?: boolean | number, defaultValue?: Int | null) => Observable<Int | null> }
  name: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  kind: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  subType: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  examplePageUrl: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  helperText: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  nameField: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  pathPrefix: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  injectWcAt: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  injectWcPosition: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  lastUpdateBy: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  repeatable: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  autoTracked: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  singleton: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  hideOptions: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  hidden: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  getSchemaFromPage: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  archived: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  individualEmbed: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  componentsOnlyMode: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  bigData: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  isPage: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  clientSideOnly: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  shopifyUseMetafieldsForContent: {
    execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null>
  }
  shopifyDoNotUsePreviewTemplates: {
    execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null>
  }
  sendToElasticSearch: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  sendToMongoDb: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  allowMetrics: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  allowTests: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  allowHeatmap: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  publicWritable: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  publicReadable: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  strictPrivateRead: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  strictPrivateWrite: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  showMetrics: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  showAbTests: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  showTargeting: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  showScheduling: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  schema: { execute: (request?: boolean | number, defaultValue?: JSONObject | null) => Observable<JSONObject | null> }
  hooks: { execute: (request?: boolean | number, defaultValue?: JSONObject | null) => Observable<JSONObject | null> }
  webhooks: { execute: (request?: boolean | number, defaultValue?: JSONObject[] | null) => Observable<JSONObject[] | null> }
  fields: { execute: (request?: boolean | number, defaultValue?: JSONObject[] | null) => Observable<JSONObject[] | null> }
  defaultQuery: { execute: (request: QueryTypeRequest, defaultValue?: QueryType[] | null) => Observable<QueryType[] | null> }
  requiredTargets: { execute: (request?: boolean | number, defaultValue?: String[] | null) => Observable<String[] | null> }
  content: { execute: (request?: boolean | number, defaultValue?: JSONObject[]) => Observable<JSONObject[]> }
  everything: { execute: (request?: boolean | number, defaultValue?: JSONObject) => Observable<JSONObject> }
}

export interface MutationPromiseChain {
  /** Create model */
  addModel: (args: {
    body: JSONObject
  }) => ModelTypePromiseChain & {
    execute: (request: ModelTypeRequest, defaultValue?: ModelType | null) => Promise<ModelType | null>
  }
  /** Update model */
  updateModel: (args: {
    body: UpdateModelInput
  }) => ModelTypePromiseChain & {
    execute: (request: ModelTypeRequest, defaultValue?: ModelType | null) => Promise<ModelType | null>
  }
  /** Delete model */
  deleteModel: (args: {
    id: String
  }) => ModelTypePromiseChain & {
    execute: (request: ModelTypeRequest, defaultValue?: ModelType | null) => Promise<ModelType | null>
  }
  /**  Create a space on a parent organization with the provided settings, requires a private key of the root organization in auth headers, returns a private key of the newly created space */
  createSpace: (args: {
    settings: JSONObject
  }) => { execute: (request?: boolean | number, defaultValue?: JSONObject) => Promise<JSONObject> }
}

export interface MutationObservableChain {
  /** Create model */
  addModel: (args: {
    body: JSONObject
  }) => ModelTypeObservableChain & {
    execute: (request: ModelTypeRequest, defaultValue?: ModelType | null) => Observable<ModelType | null>
  }
  /** Update model */
  updateModel: (args: {
    body: UpdateModelInput
  }) => ModelTypeObservableChain & {
    execute: (request: ModelTypeRequest, defaultValue?: ModelType | null) => Observable<ModelType | null>
  }
  /** Delete model */
  deleteModel: (args: {
    id: String
  }) => ModelTypeObservableChain & {
    execute: (request: ModelTypeRequest, defaultValue?: ModelType | null) => Observable<ModelType | null>
  }
  /**  Create a space on a parent organization with the provided settings, requires a private key of the root organization in auth headers, returns a private key of the newly created space */
  createSpace: (args: {
    settings: JSONObject
  }) => { execute: (request?: boolean | number, defaultValue?: JSONObject) => Observable<JSONObject> }
}
