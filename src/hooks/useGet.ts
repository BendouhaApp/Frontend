import { apiClient } from '@/lib/http'
import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
} from '@tanstack/react-query'
import type { Options } from 'ky'

type QueryPrimitive = string | number | boolean
export type UseGetQuery = Record<string, QueryPrimitive | null | undefined>
type GetOperation = 'blob' | 'json' | 'text' | 'arrayBuffer'

export interface UseGetProps<T> {
  path: string
  query?: UseGetQuery
  options?: Partial<UseQueryOptions<T, Error, T>>
  defaultOperation?: GetOperation
  skip?: number
  requestHeader?: Options
}

type FetchGetProps = {
  path: string
  query?: UseGetQuery
  defaultOperation?: GetOperation
  requestHeader?: Options
  signal?: AbortSignal
}

const normalizeQuery = (query: UseGetQuery = {}) => {
  const normalized: Record<string, QueryPrimitive> = {}

  for (const key of Object.keys(query).sort()) {
    const value = query[key]
    if (value === undefined || value === null || value === '') continue
    normalized[key] = value
  }

  return normalized
}

export const buildGetQueryKey = (
  path: string,
  query: UseGetQuery = {},
): QueryKey => {
  const pathArray = path.split('/').filter(Boolean)
  return [...pathArray, normalizeQuery(query)]
}

export const fetchGet = async <Response>({
  path,
  defaultOperation = 'json',
  requestHeader,
  query = {},
  signal,
}: FetchGetProps): Promise<Response> => {
  const normalizedQuery = normalizeQuery(query)
  const haveParams = Object.keys(normalizedQuery).length > 0

  const response = await apiClient.get(path, {
    searchParams: haveParams ? normalizedQuery : undefined,
    ...requestHeader,
    signal,
  })

  switch (defaultOperation) {
    case 'blob':
      return response.blob() as Promise<Response>
    case 'text':
      return response.text() as Promise<Response>
    case 'arrayBuffer':
      return response.arrayBuffer() as Promise<Response>
    case 'json':
    default:
      return response.json() as Promise<Response>
  }
}

export const useGet = <Response>({
  path,
  skip,
  query = {},
  options,
  defaultOperation = 'json',
  requestHeader,
}: UseGetProps<Response>) => {
  const resolvedQuery = skip === undefined ? query : { ...query, skip }

  return useQuery<Response, Error, Response>({
    queryKey: buildGetQueryKey(path, resolvedQuery),
    queryFn: ({ signal }) =>
      fetchGet<Response>({
        path,
        query: resolvedQuery,
        defaultOperation,
        requestHeader,
        signal,
      }),
    ...options,
  })
}
