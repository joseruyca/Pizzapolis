export function getRelativeTimeLabel(dateValue?: string | null) {
  if (!dateValue) return 'Price update date unknown'

  const date = new Date(dateValue)
  const now = new Date()

  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return 'Price updated today'
  if (diffDays === 1) return 'Price updated 1 day ago'
  if (diffDays < 30) return `Price updated ${diffDays} days ago`

  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths === 1) return 'Price updated 1 month ago'
  if (diffMonths < 12) return `Price updated ${diffMonths} months ago`

  const diffYears = Math.floor(diffMonths / 12)
  if (diffYears === 1) return 'Price updated 1 year ago'
  return `Price updated ${diffYears} years ago`
}
