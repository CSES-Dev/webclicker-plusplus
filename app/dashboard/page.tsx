"use client";

import { signOut } from "next-auth/react";
import React from "react";

const page = () => {
    return (
        <div>
            THIS IS DASHBOARD
            <button onClick={() => signOut()}>sign out</button>
        </div>
    );
};

export default page;
