type ToastType = 'success' | 'error' | 'info'

function emit(msg: string, type: ToastType, duration = 3500) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('app:toast', { detail: { msg, type, duration } }))
}

export const toast = {
  success: (msg: string, duration?: number) => emit(msg, 'success', duration),
  error:   (msg: string, duration?: number) => emit(msg, 'error',   duration),
  info:    (msg: string, duration?: number) => emit(msg, 'info',    duration),
}
