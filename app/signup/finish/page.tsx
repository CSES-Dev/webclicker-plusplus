// import React from 'react'

// export default function Name() {
//   return (
//     <main className="min-h-screen bg-gray-50">
//       <section className="flex justify-center pt-20">
//         <div className="flex flex-col space-y-8 content-center justify-center gap-1">
//             <p className="text-center text-3xl">
//                 Thank you for joining<br className="md:hidden" /> Webclicker++
//             </p>          
//         {/* Desktop/tablet button */}
//           <button
//             className="hidden md:block lg:block outline outline-1 px-10 py-2 rounded-lg text-lg text-white bg-[#18328D] outline-[#0029BD] hover:bg-white hover:text-[#0029BD] transition-all w-[204px] mx-auto">
//             Get Started
//           </button>
//           {/* Mobile button */}
//           <div className="block md:hidden lg:hidden text-center mt-8">
//             <button
//               className="px-10 py-2 rounded-lg text-lg bg-[#18328D] text-white hover:bg-white hover:text-[#0029BD] outline outline-1 outline-[#0029BD] transition-all w-[204px]">
//               Get Started
//             </button>
//           </div>
//         </div>
//       </section>     
//       <div className="bg-neutral hidden md:flex mt-18 items-center p-6 justify-center rounded-2xl">
//         <img 
//           src="/webclickericon.svg" 
//           alt="logo" 
//           className="w-28 h-28"
//         />
//       </div>
//     </main>
//   )
// }
import React from 'react'

export default function Name() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="flex justify-center pt-24">
        <div className="flex flex-col space-y-8 content-center justify-center gap-1">
            <p className="text-center text-3xl">
                Thank you for joining<br className="md:hidden" /> Webclicker++
            </p>          
        {/* Desktop/tablet button */}
          <button
            className="hidden md:block lg:block outline outline-1 px-10 py-2 rounded-lg text-lg text-white bg-[#18328D] outline-[#0029BD] hover:bg-white hover:text-[#0029BD] transition-all w-[204px] mx-auto">
            Get Started
          </button>
          {/* Mobile button */}
          <div className="block md:hidden lg:hidden text-center mt-8">
            <button
              className="px-10 py-2 rounded-lg text-lg bg-[#18328D] text-white hover:bg-white hover:text-[#0029BD] outline outline-1 outline-[#0029BD] transition-all w-[204px]">
              Get Started
            </button>
          </div>
        </div>
      </section>     
      <div className="bg-neutral hidden md:flex mt-18 items-center p-6 justify-center rounded-2xl">
        <img 
          src="/webclickericon.svg" 
          alt="logo" 
          className="w-28 h-28"
        />
      </div>
    </main>
  )
}