export function formatRelativeDeadline(deadline: Date): string {
  const now = new Date()
  const diffMs = deadline.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))

  if (diffMs <= 0) {
    return "Expired"
  }
  if (diffDays > 1) {
    return `${diffDays} days left`
  }
  if (diffDays === 1) {
    return "1 day left"
  }
  if (diffHours > 1) {
    return `${diffHours} hours left`
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