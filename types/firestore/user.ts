import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore"

// Document — what you read from Firestore (after conversion)
export interface UserProfile {
  id: string
  codename: string
}

// Create Input — what you pass to setDoc (doc id is the auth uid)
export interface CreateUserProfileInput {
  codename: string
  id: string
}

export const userConverter = {
  toFirestore: (data: Partial<UserProfile>): DocumentData => data,

  fromFirestore: (snapshot: QueryDocumentSnapshot): UserProfile =>
    ({
      id: snapshot.id,
      ...snapshot.data(),
    }) as UserProfile,
}
