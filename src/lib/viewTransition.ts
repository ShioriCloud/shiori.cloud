/** Wrap a DOM/state update in the View Transitions API when supported. */
export const withViewTransition = (update: () => void): void => {
  if (typeof document === 'undefined') {
    update()
    return
  }

  const doc = document as Document & {
    startViewTransition?: (callback: () => void) => void
  }

  if (typeof doc.startViewTransition === 'function') {
    doc.startViewTransition(() => {
      update()
    })
    return
  }

  update()
}
