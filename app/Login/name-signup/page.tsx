import React from 'react'

export default function name() {
    return (
        <main>
            <section className=" min-h-full min-w-full flex justify-center">
                <div className="flex flex-col space-y-8 content-center justify-center gap-1">
                    <p className='text-center mt-40 text-2xl'>Enter your name: </p>
                    <label className='outline outline-1 pl-6 pr-16 py-2 rounded-lg bg-white' >
                        <input className = "text-black bg-white focus:outline-none sm:hover:bg-blue-400" placeholder="First Name" />
                    </label>                    
                    <label className='outline outline-1 pl-6 pr-16 py-2 rounded-lg bg-white' >
                        <input className = "text-black bg-white focus:outline-none " placeholder="Last Name" />
                    </label>        
                    {/* <label className="input input-bordered flex items-center ">
                        <input type="text" className="grow" placeholder="Last Name" />
                    </label> */}
                </div>
            </section>
            
            <footer className="flex min-w-screen items-center justify-between md:px-60 py-6 md:py-11 lg:px-60 lg:py-6 ">
                <img src="/webclickericon.svg" alt="png" className="w-0 h-0 bg- md:w-24 md:h-24 lg:w-24 lg:h-24"/>
                <button 
                        className="btn sm:mr-8 px-4 py-2 rounded-lg text-lg bg-blue-300 text-white hover:bg-blue-400 transition-all"
                    >
                        Continue
                    </button>
            </footer>

        </main>
    )
}


