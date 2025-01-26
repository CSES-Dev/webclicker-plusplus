// import React from 'react'

// export default function name() {
//     return (
//         <main className="min-h-screen flex flex-col">
//             <section className="flex-grow flex justify-center">
//                 <div className="flex flex-col space-y-6 content-center justify-center w-full px-4 max-w-md">
//                     <p className='text-2xl mb-4'>Enter Your Name:</p>
//                     <input 
//                         className="p-4 rounded-lg bg-gray-50 w-full focus:outline-none" 
//                         placeholder="First Name"
//                     />
//                     <input 
//                         className="p-4 rounded-lg bg-gray-50 w-full focus:outline-none" 
//                         placeholder="Last Name"
//                     />
//                     <button className="mt-8 w-full bg-blue-800 text-white py-4 rounded-lg">
//                         Continue
//                     </button>
//                 </div>
//             </section>
            
//             <div className="p-4">
//                 <img src="/webclickericon.svg" alt="logo" className="w-0 h-0 md:w-24 md:h-24"/>
//             </div>
//         </main>
//     )
// }

import React from 'react'

export default function Name() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Content section */}
      <section className="flex justify-center pt-20">
        <div className="flex flex-col space-y-8 content-center justify-center gap-1">
          <p className="text-center text-2xl">Enter your name:</p>
          <label className="outline outline-1 pl-8 pr-20 py-3 rounded-lg bg-white">
            <input
              className="text-black bg-white focus:outline-none"
              placeholder="First Name"
            />
          </label>
          <label className="outline outline-1 pl-8 pr-20 py-3 rounded-lg bg-white">
            <input
              className="text-black bg-white focus:outline-none"
              placeholder="Last Name"
            />
          </label>
          <div className="block md:hidden lg:hidden text-center mt-8">
            {/* Button for mobile (below inputs) */}

        <button
          className="px-10 py-2 rounded-lg text-lg bg-blue-500 text-white hover:bg-blue-600 transition-all"
        >
          Continue
        </button>
        </div>
      </div>
      </section>

      {/*
        Image & Button on desktop:
        - Use hidden md:flex to show only on md+ screens.
        - Fixed at the bottom, spanning from left-0 to right-0.
        - Use justify-between so the image goes to the left, button to the right.
      */}
      <div className="hidden md:flex fixedleft-72 right-72 bottom-44 items-center justify-between p-6">
        <img 
          src="/webclickericon.svg" 
          alt="logo" 
          className="w-28 h-28"
        />
        <button
          className="px-10 py-2 rounded-lg text-lg bg-blue-500 text-white hover:bg-blue-600 transition-all"
        >
          Continue
        </button>
      </div>
    </main>
  )
}

