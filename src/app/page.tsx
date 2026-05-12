import SwipeDeck from "@/components/SwipeDeck";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4 py-12 font-sans">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-2">
          Baby Name Tinder
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Swipe right on names you love, left to skip
        </p>
      </header>
      <SwipeDeck />
    </div>
  );
}
