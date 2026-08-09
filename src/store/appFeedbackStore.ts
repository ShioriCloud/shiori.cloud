import { toast } from 'sonner'
import { create } from 'zustand'

export type ToastTone = 'default' | 'success' | 'error' | 'warning'

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
  confirm: AppConfirmRequest | null
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
  if (/هنوز در کاتالوگ|درخواست ترجمه/i.test(text)) return 'warning'
  if (/شد|به‌روز|فعال|اضافه|ساخته|ذخیره|حذف شد/i.test(text)) return 'success'
  return 'default'
}

export const useAppFeedbackStore = create<AppFeedbackState>((set, get) => ({
  confirm: null,

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

export const showAppToast = (
  message: string,
  tone?: ToastTone,
  options?: {
    description?: string
    action?: {
      label: string
      onClick: () => void
    }
    duration?: number
  }
) => {
  const trimmed = String(message ?? '').trim()
  if (!trimmed) return

  const resolvedTone = tone ?? inferTone(trimmed)
  const payload = {
    description: options?.description?.trim() || undefined,
    duration: options?.duration ?? 3200,
    closeButton: false,
    action: options?.action
      ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
      : undefined,
  }

  if (resolvedTone === 'success') {
    toast.success(trimmed, payload)
    return
  }
  if (resolvedTone === 'error') {
    toast.error(trimmed, payload)
    return
  }
  if (resolvedTone === 'warning') {
    toast.warning(trimmed, payload)
    return
  }
  toast(trimmed, payload)
}

export const showAppConfirm = (input: {
  message: string
  title?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}): Promise<boolean> => useAppFeedbackStore.getState().requestConfirm(input)
