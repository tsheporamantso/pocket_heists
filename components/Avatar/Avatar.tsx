import styles from "./Avatar.module.css"

interface AvatarProps {
  name: string
}

function getInitials(name: string): string {
  const upperLetters = name.match(/[A-Z]/g) ?? []
  if (upperLetters.length >= 2) {
    return upperLetters.slice(0, 2).join("")
  }
  return name.charAt(0).toUpperCase()
}

export default function Avatar({ name }: AvatarProps) {
  return (
    <div
      className={styles.avatar}
      role="img"
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  )
}
