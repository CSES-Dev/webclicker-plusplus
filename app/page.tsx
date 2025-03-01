import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <div className="bg-primary grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
            <main className="flex flex-col gap-8 row-start-2 items-start sm:items-center">
                <h1 className="text-2xl text-primary-foreground font-semibold">
                    WebClicker++ how you doing
                </h1>
                <Button variant="outline">Click</Button>
            </main>
            <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
                <a
                    className="text-primary-foreground flex items-center gap-2 hover:underline hover:underline-offset-4"
                    href="https://csesucsd.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    CSES UCSD
                </a>
            </footer>
        </div>
    );
}

// LandingPage.js

// import { signIn } from 'next-auth/react';

// export const LandingPage = () => {
//   const handleSignIn = async () => {
//     await signIn('google');
//   };

//   return (
//     <div>
//       <h1>Welcome to Our Next.js App!</h1>
//       <p>Please sign in to access the full content.</p>
//       <button onClick={handleSignIn}>Sign in</button>
//     </div>
//   );
// };
