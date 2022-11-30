import type { AppProps } from "next/app"

import Header from "../components/Header"
import "styles/globals.css"
import { useAtom } from "jotai"
import { sessionAtom, SessionContext } from "../lib/session"
import { useEffect } from "react"

import "../lib/i18n"
import i18next from "i18next"

function App({ Component, pageProps }: AppProps) {
  const [session, setSession] = useAtom(sessionAtom)
  useEffect(() => {
    i18next.changeLanguage(window.navigator.language)
  }, [])
  useEffect(() => {
    const sessionId = window.sessionStorage.getItem("session")
    if (!sessionId) return
    setSession({ session: sessionId })
  }, [])
  useEffect(() => {
    const sessionId = session?.session
    if (!sessionId) return
    if ("profile" in session) return
    fetch("/api/profile", {
      headers: {
        Authorization: sessionId,
      },
    }).then(async (res) => {
      if (!res.ok) {
        window.sessionStorage.removeItem("session")
        setSession(null)
        return
      }
      const profile = await res.json()
      setSession({ session: sessionId, profile })
    })
  }, [session])
  return (
    <>
      <Header />
      <div className="m-4">
        {!session || "profile" in session ? (
          <SessionContext.Provider value={session}>
            <Component {...pageProps} />
          </SessionContext.Provider>
        ) : (
          <div className="text-center">Loading...</div>
        )}
      </div>
    </>
  )
}

export default App
