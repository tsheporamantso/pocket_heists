export const ADJECTIVES = [
  "silent",
  "shadowy",
  "golden",
  "swift",
  "cunning",
  "midnight",
  "lucky",
  "reckless",
  "velvet",
  "sneaky",
]

export const COLOURS = [
  "crimson",
  "emerald",
  "amber",
  "cobalt",
  "ivory",
  "onyx",
  "scarlet",
  "violet",
  "copper",
  "silver",
]

export const ANIMALS = [
  "fox",
  "raven",
  "panther",
  "otter",
  "hawk",
  "wolf",
  "gecko",
  "lynx",
  "badger",
  "cobra",
]

function pascal(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

function pick(words: string[]) {
  return words[Math.floor(Math.random() * words.length)]
}

export function generateCodename() {
  return [pick(ADJECTIVES), pick(COLOURS), pick(ANIMALS)].map(pascal).join("")
}
