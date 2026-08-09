import { createElement, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Alert02Icon, CheckmarkCircle02Icon, InformationCircleIcon } from 'hugeicons-react'
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

/** Tone drives icon color only — toast surface stays neutral. */
const inferTone = (message: string): ToastTone => {
  const text = message.trim()
  if (/خطا|ناموفق|موجود نیست|تمام شده|لازم است|فعال نشده/i.test(text)) return 'error'
  if (/هنوز در کاتالوگ|درخواست ترجمه|کاتالوگ شیوری نیست/i.test(text)) return 'warning'
  // Completed removals stay neutral (not "success green").
  if (/حذف شد|از لیست حذف|از علاقه‌مندی/i.test(text)) return 'default'
  if (/به‌روز|فعال|اضافه|ساخته|ذخیره شد|لیست‌ها به‌روز/i.test(text)) return 'success'
  return 'default'
}

const toneIcon = (tone: ToastTone): ReactNode => {
  if (tone === 'success') {
    return createElement(CheckmarkCircle02Icon, {
      className: 'size-5 shrink-0 text-emerald-500',
      'aria-hidden': true,
    })
  }
  if (tone === 'error') {
    return createElement(Alert02Icon, {
      className: 'size-5 shrink-0 text-red-500',
      'aria-hidden': true,
    })
  }
  if (tone === 'warning') {
    return createElement(Alert02Icon, {
      className: 'size-5 shrink-0 text-amber-500',
      'aria-hidden': true,
    })
  }
  return createElement(InformationCircleIcon, {
    className: 'size-5 shrink-0 text-muted-foreground',
    'aria-hidden': true,
  })
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

  toast(trimmed, {
    description: options?.description?.trim() || undefined,
    duration: options?.duration ?? 3200,
    closeButton: false,
    icon: toneIcon(resolvedTone),
    action: options?.action
      ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
      : undefined,
  })
}

export const showAppConfirm = (input: {
  message: string
  title?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}): Promise<boolean> => useAppFeedbackStore.getState().requestConfirm(input)
