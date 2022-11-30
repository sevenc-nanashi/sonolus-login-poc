import Link from "next/link"

const Header = () => (
  <header className="text-sl bg-slate-900 text-white p-4">
    <Link href="/">
      <h1 className="text-3xl font-extrabold">Sonolus Login PoC</h1>
    </Link>
  </header>
)

export default Header
