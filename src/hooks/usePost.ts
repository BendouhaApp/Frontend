import { apiClient } from '@/lib/http'
import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query'
import { HTTPError, type Options, type KyResponse } from 'ky'
import { toast } from 'sonner'

// Generic form type for error handling
interface FormWithSetError {
  setError: (name: string, error: { message: string }) => void
}

interface Props<TVariables, TResponse> {
  path: string
  query?: Record<string, unknown>
  options?: Omit<UseMutationOptions<TResponse, Error, TVariables>, 'mutationFn'>
  method?: 'post' | 'put' | 'delete'
  requestHeader?: Options
  form?: FormWithSetError
  successMessage?: string
  errorMessage?: string
}

export const usePost = <TVariables, TResponse>({
  path,
  options,
  method = 'post',
  requestHeader,
  form,
  successMessage = 'Succès',
  errorMessage = "L'opération a échoué",
}: Props<TVariables, TResponse>) => {
  const queryClient = useQueryClient()
  const pathArray = path.split('/')

  const { onSuccess, onError, ...mutationOptions } = options ?? {}

  const mutation = useMutation<TResponse, Error, TVariables>({
    mutationFn: async (body: TVariables) => {
      let res: KyResponse
      if (body instanceof FormData) {
        res = await apiClient[method](path, { body, ...requestHeader })
      } else {
        res = await apiClient[method](path, {
          json: body,
          ...requestHeader,
        })
      }
      return res.json() as Promise<TResponse>
    },
    onSuccess: (data, variables, context) => {
      toast.success(successMessage)
      queryClient.invalidateQueries({
        queryKey: [pathArray[0]],
      })
      onSuccess?.(data, variables, context)
    },
    onError: async (error: Error, variables, context) => {
      toast.error(errorMessage)
      if (error instanceof HTTPError) {
        try {
          const errorData: { errors?: { path: string; message: string }[] } =
            await error.response.json()
          if (form && errorData?.errors) {
            for (const fieldError of errorData.errors) {
              form.setError(fieldError.path as never, {
                message: fieldError.message,
              })
            }
          }
        } catch {
          // JSON parsing failed, ignore
        }
      }
      onError?.(error, variables, context)
    },
    ...mutationOptions,
  })

  return mutation
}
