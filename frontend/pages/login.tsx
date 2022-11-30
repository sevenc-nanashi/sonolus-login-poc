import { useAtom } from "jotai"
import type { NextPage } from "next"
import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { isDev } from "../lib/const"

import { sessionAtom } from "../lib/session"

export const translations = {
  ja: {
    title: "ログイン",
    pageTitle: "Sonolus Login PoC | ログイン",

    step1: "1. Sonolusで以下のサーバーを追加してください。",
    step2: "2. [ 検索 ]を押し、コードを入力して下さい。",
    step2note: "コードは100秒で無効になります。",
    alternative:
      "また、このデバイスにSonolusがインストールされている場合は、ボタンを押すことでログインできます。",
    openSonolus: "Sonolusを開く",
  },
  en: {
    title: "Login",
    pageTitle: "Sonolus Login PoC | Login",

    step1: "1. Add the following server in Sonolus.",
    step2: "2. Press [ Search ] and enter the code.",
    step2note: "The code will expire in 100 seconds.",
    alternative:
      "Alternatively, if Sonolus is installed on this device, you can login by pressing the button.",
    openSonolus: "Open Sonolus",
  },
}

const Login: NextPage<{ host: string }> = () => {
  const { t } = useTranslation("login")

  const [loginNonce, setLoginNonce] = useState("")
  const router = useRouter()
  const [_session, setSession] = useAtom(sessionAtom)
  const fetchStrictCall = useRef(true)
  const regenerateNonce = () => {
    fetch("/api/login", { method: "POST" })
      .then((res) => res.json())
      .then((json) => {
        setLoginNonce(json.nonce)
      })
  }
  useEffect(() => {
    if (fetchStrictCall.current && isDev) {
      fetchStrictCall.current = false
      return
    }
    regenerateNonce()
  }, [])

  const host = useRef("")
  useEffect(() => {
    host.current = `${window.location.protocol}//${window.location.host}`
  })
  const intervalStrictCall = useRef(true)
  useEffect(() => {
    if (intervalStrictCall.current && isDev) {
      intervalStrictCall.current = false
      return
    }
    const interval = setInterval(() => {
      if (!loginNonce) return
      fetch(`/api/login/${loginNonce}`, { method: "GET" })
        .then((res) => res.json())
        .then((json) => {
          if (json.status === "success") {
            setSession({ session: json["session"] })
            window.sessionStorage.setItem("session", json["session"])
            router.push("/")
          } else if (json.status === "unknown") {
            regenerateNonce()
          }
        })
    }, 2500)
    return () => clearInterval(interval)
  }, [loginNonce])

  const getHost = (host: string) => host && new URL(host).host

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <div className="">
          {t("step1")}
          <div className="mx-8 my-4 p-4 text-xl rounded bg-slate-200 text-center">
            {process.env.NEXT_PUBLIC_SONOLUS_HOST || host.current}
          </div>
          {t("step2")}
          <div className="mx-8 my-4 p-8 rounded bg-slate-200 tracking-widest text-center">
            <div className="text-6xl font-monospace">
              {loginNonce || "--------"}
            </div>
            <div className="text-sm text-gray-500">{t("step2note")}</div>
          </div>
          <span className="leading-snug">{t("alternative")}</span>
          <div className="mt-4">
            <a
              className="p-2 bg-sonolus rounded cursor-pointer text-white"
              href={`sonolus://${getHost(
                process.env.NEXT_PUBLIC_SONOLUS_HOST || host.current
              )}/levels/login-${loginNonce}`}
            >
              {t("openSonolus")}
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login
