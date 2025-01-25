

import { Button } from "@/components/ui/button";

export default function Login() {
    return (
        <div className="flex w-full flex-col lg:flex-row"> 
        {/* DESKTOP:Left-side, MOBILE:Top-side */}
            <section className="h-[50vh] lg:h-screen w-full lg:w-1/2 card bg-base-300 rounded-box grid flex-grow place-items-center bg-custom-blue">
                <div className=" flex flex-col justify-center items-center">
                    <img src="/cube.svg" alt="png" className="w-20 h-20 sm:w-12 sm:h-12 lg:w-20 lg:h-20 pb-2"/>
                    <h1 className="text-2xl text-primary-foreground font-semibold">WebClicker++</h1>
                </div>
            </section>
            
            {/** DESKTOP:Right-side MOBILE:Bottom-side */}
            <section className="h-[50vh] lg:h-screen w-full lg:w-1/2 card bg-base-300 rounded-box grid flex-grow place-items-center">
                {/** Container for the content (sign up button, "Welcome to...", etc.)  */}
                <div className=" flex flex-col justify-center items-center">
                    <h1 className="text-3xl text-primary-foreground font-sans text-slate-700">Welcome to WebClicker++</h1>
                    <div className="flex flex-col mt-11 items-center">
                        <button className="flex items-center bg-blue-950 dark:bg-gray-900 border border-gray-300 rounded-lg shadow-md px-9 py-3 text-sm font-medium text-gray-800 dark:text-white hover:bg-slate-400 focus:outline-none active:bg-slate-500 ">
                            <img src="/googlebutton.svg"/>
                            <span className="ml-3 text-white">Sign in with Google</span>
                        </button>
                        <p className="text-gray-500 pt-6 text-sm">Don't have an account? <a className="text-blue-700 underline" href="">Sign up</a></p>
                    </div>
                </div>
            </section>
            <div className="divider lg:divider-horizontal"></div>
        </div>
    );
}
