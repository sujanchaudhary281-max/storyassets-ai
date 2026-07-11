import { toast as sonnerToast } from 'sonner'

/**
 * Utility for showing toast notifications with consistent styling
 */
export const toast = {
  /**
   * Show a success message
   */
  success: (message: string, description?: string) => {
    return sonnerToast.success(message, { description })
  },

  /**
   * Show an error message
   */
  error: (message: string, description?: string) => {
    return sonnerToast.error(message, { description })
  },

  /**
   * Show an info message
   */
  info: (message: string, description?: string) => {
    return sonnerToast.info(message, { description })
  },

  /**
   * Show a warning message
   */
  warning: (message: string, description?: string) => {
    return sonnerToast.warning(message, { description })
  },

  /**
   * Show a loading message with promise
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    return sonnerToast.promise(promise, messages)
  },

  /**
   * Show error from API response
   */
  apiError: (error: any, defaultMessage: string = 'An error occurred') => {
    let message = defaultMessage
    let description: string | undefined

    if (error instanceof Error) {
      message = error.message
    } else if (error?.message) {
      message = error.message
      description = error.details
    } else if (typeof error === 'string') {
      message = error
    }

    return sonnerToast.error(message, { description })
  },
}

/**
 * Handle API errors and show appropriate toast
 */
export function handleApiError(error: any, defaultMessage?: string) {
  console.error('API Error:', error)
  toast.apiError(error, defaultMessage)
}

/**
 * Parse error from Response object
 */
export async function parseApiError(response: Response): Promise<string> {
  try {
    const json = await response.json()
    return json.error || json.message || 'An error occurred'
  } catch {
    return `Request failed with status ${response.status}`
  }
}
