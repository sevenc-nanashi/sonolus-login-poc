import { initReactI18next } from "react-i18next"
import i18n from "i18next"

i18n.use(initReactI18next).init({
  lng: "ja",
  resources: {
    ja: {
      index: {
        description: "これはSonolusでログインを実装するためのPoCです。",

        loggedIn: "ログインしています！",
        helloBefore: "こんにちは、",
        helloAfter: "さん！",
        logout: "ログアウト",

        notLoggedIn: "ログインしていません。",
        loginDescription: "次のボタンを押してログインしましょう！",
        login: "Sonolusでログイン",
      },
      login: {
        title: "ログイン",
        pageTitle: "Sonolus Login PoC | ログイン",

        step1: "1. Sonolusで以下のサーバーを追加してください。",
        step2: "2. [ 検索 ]を押し、コードを入力して下さい。",
        step2note: "コードは100秒で無効になります。",
        alternative:
          "また、このデバイスにSonolusがインストールされている場合は、ボタンを押すことでログインできます。",
        openSonolus: "Sonolusを開く",
      },
    },
    en: {
      index: {
        description: 'This is a PoC for implementing "login with Sonolus."',
        loggedIn: "You are logged in!",
        helloBefore: "Hello, ",
        helloAfter: "!",
        logout: "Logout",

        notLoggedIn: "You are not logged in.",
        loginDescription: "Press the button to login!",
        login: "Login with Sonolus",
      },
      login: {
        title: "Login",
        pageTitle: "Sonolus Login PoC | Login",

        step1: "1. Add the following server in Sonolus.",
        step2: "2. Press [ Search ] and enter the code.",
        step2note: "The code will expire in 100 seconds.",
        alternative:
          "Alternatively, if Sonolus is installed on this device, you can login by pressing the button.",
        openSonolus: "Open Sonolus",
      },
    },
  },
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
})
