import { create } from 'zustand'

export type ToastTone = 'default' | 'success' | 'error'

export type AppToast = {
  id: string
  message: string
  tone: ToastTone
}

export type AppConfirmRequest = {
  id: string
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  destructive: boolean
  resolve: (confirmed: boolean) => void
}

type AppFeedbackState = {
  toasts: AppToast[]
  confirm: AppConfirmRequest | null
  pushToast: (message: string, tone?: ToastTone) => void
  dismissToast: (id: string) => void
  requestConfirm: (input: {
    message: string
    title?: string
    confirmLabel?: string
    cancelLabel?: string
    destructive?: boolean
  }) => Promise<boolean>
  clearConfirm: () => void
}

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const inferTone = (message: string): ToastTone => {
  const text = message.trim()
  if (/خطا|ناموفق|موجود نیست|تمام شده|لازم است|فعال نشده/i.test(text)) return 'error'
  if (/شد|به‌روز|فعال|اضافه|ساخته|ذخیره|حذف شد/i.test(text)) return 'success'
  return 'default'
}

export const useAppFeedbackStore = create<AppFeedbackState>((set, get) => ({
  toasts: [],
  confirm: null,

  pushToast: (message, tone) => {
    const trimmed = String(message ?? '').trim()
    if (!trimmed) return
    const toast: AppToast = {
      id: newId(),
      message: trimmed,
      tone: tone ?? inferTone(trimmed),
    }
    set((s) => ({ toasts: [...s.toasts.slice(-2), toast] }))
    window.setTimeout(() => {
      get().dismissToast(toast.id)
    }, 2800)
  },

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  requestConfirm: ({ message, title, confirmLabel, cancelLabel, destructive }) =>
    new Promise<boolean>((resolve) => {
      const current = get().confirm
      if (current) {
        current.resolve(false)
      }
      set({
        confirm: {
          id: newId(),
          title: title?.trim() || 'تأیید',
          message: String(message ?? '').trim(),
          confirmLabel: confirmLabel?.trim() || 'تأیید',
          cancelLabel: cancelLabel?.trim() || 'انصراف',
          destructive: Boolean(destructive),
          resolve,
        },
      })
    }),

  clearConfirm: () => set({ confirm: null }),
}))

export const showAppToast = (message: string, tone?: ToastTone) => {
  useAppFeedbackStore.getState().pushToast(message, tone)
}

export const showAppConfirm = (input: {
  message: string
  title?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}): Promise<boolean> => useAppFeedbackStore.getState().requestConfirm(input)
