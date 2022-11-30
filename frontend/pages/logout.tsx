import { useAtom } from "jotai"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { sessionAtom } from "../lib/session"

const Logout = () => {
  const router = useRouter()
  const [session, setSession] = useAtom(sessionAtom)
  useEffect(() => {
    window.sessionStorage.removeItem("session")
    setSession(null)
    fetch("/api/session", {
      method: "DELETE",
      headers: { Authorization: session?.session || "" },
    }).then(() => {
      router.push("/")
    })
  }, [])
  return <div>...</div>
}

export default Logout
