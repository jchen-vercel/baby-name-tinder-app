import { SignIn } from "@clerk/nextjs";

import { clerkDarkAppearance } from "@/lib/clerk-appearance";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <SignIn appearance={clerkDarkAppearance} />
    </main>
  );
}
