import { apiClient } from '@/lib/http'
import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Options } from 'ky'

type ActionData = {
  method: 'post' | 'put' | 'delete' | 'patch'
  path: string
  body?: unknown
  invalidateQueries?: boolean
  requestHeader?: Options
}

export const usePostAction = <TResponse>(
  options?: Omit<UseMutationOptions<TResponse, Error, ActionData>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  const mutation = useMutation<TResponse, Error, ActionData>({
    mutationFn: async ({
      invalidateQueries = true,
      method,
      path,
      body,
      requestHeader,
    }: ActionData) => {
      const res = await apiClient[method](path, {
        json: body,
        ...requestHeader,
      })
      const resData = (await res.json()) as TResponse
      if (invalidateQueries) {
        const pathArray = path.split('/')
        queryClient.invalidateQueries({
          queryKey: [pathArray[0]],
        })
      }
      return resData
    },
    onSuccess: () => {
      toast.success('Succès')
    },
    onError: () => {
      toast.error("L'opération a échoué")
    },
    ...options,
  })

  return mutation
}
