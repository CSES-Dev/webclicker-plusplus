'use client'

import React from 'react'
import { signOut } from 'next-auth/react'

const page = () => {
  return (
    <div>
      THIS IS DASHBOARD
      <button onClick={() => signOut()}>
      sign out
    </button>
    </div>
  )
}

export default page
