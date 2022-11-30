import type { NextPage } from "next"
import Head from "next/head"
import Link from "next/link"
import { SessionContext } from "../lib/session"
import Highlight from "react-highlight"

import "highlight.js/styles/github.css"
import { useTranslation } from "react-i18next"

export const translations = {
  ja: {
    description: "これはSonolusでログインを実装するためのPoCです。",

    loggedIn: "ログインしています！",
    helloBefore: "こんにちは、",
    helloAfter: "さん！",
    logout: "ログアウト",

    notLoggedIn: "ログインしていません。",
    loginDescription: "次のボタンを押してログインしましょう！",
    login: "Sonolusでログイン",
  },
  en: {
    description: "This is a PoC for implementing login in Sonolus.",
    loggedIn: "You are logged in!",
    helloBefore: "Hello, ",
    helloAfter: "!",
    logout: "Logout",

    notLoggedIn: "You are not logged in.",
    loginDescription: "Press the button to login!",
    login: "Login with Sonolus",
  },
}

const Home: NextPage = () => {
  const { t } = useTranslation("index")
  return (
    <SessionContext.Consumer>
      {(session) => (
        <>
          <Head>
            <title>Sonolus Login PoC</title>
          </Head>
          <div>
            <h2 className="text-3xl font-bold">Sonolus Login PoC</h2>
            <div className="mb-4">{t("description")}</div>
            {session ? (
              <>
                <h2 className="text-2xl font-bold">{t("loggedIn")}</h2>
                <div className="mb-2">
                  {t("helloBefore")}
                  <span
                    className="font-bold px-2 p-1 m-2 rounded-sm"
                    style={{
                      color: session.profile.avatarForegroundColor,
                      backgroundColor: session.profile.avatarBackgroundColor,
                    }}
                  >
                    {session.profile.name}
                    <span className="font-sans text-sm">
                      #{session.profile.handle}
                    </span>
                  </span>

                  {t("helloAfter")}
                  <Highlight className="json mt-2 !bg-slate-100 rounded overflow-x-scroll max-w-min w-full">
                    {JSON.stringify(session.profile, null, 2)}
                  </Highlight>
                </div>

                <Link href="/logout">
                  <span className="text-blue-500">{t("logout")}</span>
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold">{t("notLoggedIn")}</h2>
                <div className="mb-2">{t("loginDescription")}</div>
                <Link href="/login">
                  <span className="p-2 bg-sonolus rounded cursor-pointer text-white">
                    {t("login")}
                  </span>
                </Link>
              </>
            )}
          </div>
        </>
      )}
    </SessionContext.Consumer>
  )
}

export default Home
