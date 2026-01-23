import { apiClient } from '@/lib/http'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

export interface UseGetProps<T> {
  path: string
  query?: Record<string, string | number | boolean>
  options?: Partial<UseQueryOptions<T, Error, T>>
  defaultOperation?: 'blob' | 'json' | 'text' | 'arrayBuffer'
  skip?: number
}

export const useGet = <Response>({
  path,
  skip,
  query = skip === undefined ? {} : { skip: 0 },
  options,
  defaultOperation = 'json',
}: UseGetProps<Response>) => {
  const pathArray = path.split('/')

  const haveParams = Object.keys(query).length > 0
  
  return useQuery<Response, Error, Response>({
    queryKey: [...pathArray, query],
    queryFn: async () => {
      const response = await apiClient.get(path, {
        searchParams: haveParams ? query : undefined,
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
    },
    ...options,
  })
}
