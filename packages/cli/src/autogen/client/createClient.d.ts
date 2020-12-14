import { Client, ClientOptions } from 'graphql-typed-client'
import { QueryRequest, QueryPromiseChain, Query, MutationRequest, MutationPromiseChain, Mutation } from './schema'
export declare const createClient: (
  options: ClientOptions,
) => Client<QueryRequest, QueryPromiseChain, Query, MutationRequest, MutationPromiseChain, Mutation, never, never, never>
