import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-lg font-black tracking-tight">
          Baby Name Tinder
        </Link>
        <Show when="signed-in">
          <div className="flex items-center gap-4">
            <Link
              href="/app"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Open app
            </Link>
            <UserButton />
          </div>
        </Show>
        <Show when="signed-out">
          <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
            <SignInButton mode="modal">Sign in</SignInButton>
          </span>
        </Show>
      </nav>

      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-600 shadow-sm">
            Swipe separately. Match together.
          </p>
          <h1 className="max-w-3xl text-5xl font-black tracking-tight text-slate-950 md:text-7xl">
            Find the baby names you both love.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Create a couple, choose mother or father, and swipe through a huge
            baby-name pool. When both parents like the same name, it lands on
            your shared match list.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Show when="signed-in">
              <Link
                href="/app"
                className="rounded-full bg-rose-600 px-6 py-3 text-center font-bold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700"
              >
                Start swiping
              </Link>
            </Show>
            <Show when="signed-out">
              <span className="rounded-full bg-rose-600 px-6 py-3 font-bold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700">
                <SignInButton mode="modal">Get started</SignInButton>
              </span>
              <span className="rounded-full border border-rose-200 bg-white px-6 py-3 text-center font-bold text-slate-900 transition hover:border-rose-300">
                <SignUpButton mode="modal">Create account</SignUpButton>
              </span>
            </Show>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute -left-8 top-10 h-40 w-40 rounded-full bg-pink-200 blur-3xl" />
          <div className="absolute -right-10 bottom-8 h-40 w-40 rounded-full bg-amber-200 blur-3xl" />
          <div className="relative rounded-[2rem] bg-white p-6 shadow-2xl shadow-rose-200">
            <div className="rounded-[1.5rem] border border-rose-100 bg-gradient-to-br from-white to-rose-50 p-8">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-rose-400">
                Today&apos;s name
              </p>
              <h2 className="mt-10 text-center text-6xl font-black text-slate-950">
                Isla
              </h2>
              <p className="mt-4 text-center text-slate-500">
                Scottish origin · “island”
              </p>
              <div className="mt-12 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-100 py-4 text-center text-2xl">
                  Pass
                </div>
                <div className="rounded-2xl bg-rose-600 py-4 text-center text-2xl text-white">
                  Like
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
