import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function Home() {
    return (
        <div className="bg-primary  grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-start sm:items-center">
                <h1 className="text-2xl text-primary-foreground font-semibold">WebClicker++</h1>
                <Button variant="outline">Click</Button>
                  <Link href="/addCourse">
                    <button className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                      Add Course
                    </button>
                  </Link>                
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

// import Link from 'next/link';

// <main className="flex flex-col gap-8 row-start-2 items-start sm:items-center">
//   <h1 className="text-2xl text-primary-foreground font-semibold">WebClicker++</h1>
//   <Link href="/addCourse">
//     <button className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
//       Add Course
//     </button>
//   </Link>
// </main>
