import { atom } from "jotai"
import type { UserProfile } from "sonolus-core"
import { createContext } from "react"

type Session = {
  session: string
  profile: UserProfile
}
export const sessionAtom = atom<Session | Omit<Session, "profile"> | null>(null)
export const SessionContext = createContext<Session | null>(null)
