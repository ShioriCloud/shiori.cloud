export const AnimeDetailSynopsis = ({
  description,
  showFull,
  onToggle,
}: {
  description: string
  showFull: boolean
  onToggle: () => void
}) => {
  const shouldTruncate = description.length > 180
  const truncatedDescription =
    shouldTruncate && !showFull ? `${description.substring(0, 180)}…` : description

  return (
    <div className="mx-4 mt-4 surface-skeuo rounded-xl p-4">
      <h2 className="text-sm font-semibold text-foreground mb-2">خلاصه داستان</h2>
      <p className="text-sm text-muted-foreground leading-6 whitespace-pre-wrap">
        {truncatedDescription}
      </p>
      {shouldTruncate && (
        <button
          type="button"
          onClick={onToggle}
          className="mt-2 text-primary-400 text-xs font-medium"
        >
          {showFull ? 'نمایش کمتر' : 'نمایش بیشتر'}
        </button>
      )}
    </div>
  )
}
