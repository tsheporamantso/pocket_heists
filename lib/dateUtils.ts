const MS_PER_HOUR = 1000 * 60 * 60
const MS_PER_DAY = MS_PER_HOUR * 24

export function formatRelativeDeadline(deadline: Date): string {
  const now = new Date()
  const diffMs = deadline.getTime() - now.getTime()

  if (diffMs <= 0) {
    return "Expired"
  }
  const days = diffMs / MS_PER_DAY
  if (days >= 2) {
    return `${Math.floor(days)} days left`
  }
  if (days >= 1) {
    return "1 day left"
  }
  const hours = diffMs / MS_PER_HOUR
  if (hours >= 2) {
    return `${Math.floor(hours)} hours left`
  }
  return "1 hour left"
}

export function formatAbsoluteDeadline(deadline: Date): string {
  return deadline.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatRelativeExpiry(deadline: Date): string {
  const now = new Date()
  const elapsedMs = now.getTime() - deadline.getTime()

  if (elapsedMs <= 0) {
    return "Expired"
  }
  const days = elapsedMs / MS_PER_DAY
  if (days >= 2) {
    return `Expired ${Math.floor(days)} days ago`
  }
  if (days >= 1) {
    return "Expired 1 day ago"
  }
  const hours = elapsedMs / MS_PER_HOUR
  if (hours >= 2) {
    return `Expired ${Math.floor(hours)} hours ago`
  }
  return "Expired 1 hour ago"
}