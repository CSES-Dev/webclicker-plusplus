"use client";

import { useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function Home() {
    //state for dropdown menu
    const [roleSelected, setRoleSelected] = useState("");

    //will update the local storage with the value of select dropdown
    function updateStorage(value: string) {
        localStorage.setItem("userRole", value);
        setRoleSelected(value);
    }

    const roles = [
        { value: "LECTURER", label: "Lecturer" },
        { value: "STUDENT", label: "Student" },
    ];

    //this function runs after a page render
    useEffect(() => {
        const userRole = localStorage.getItem("userRole");
        if (userRole) {
            setRoleSelected(userRole);
        }
    }, []);

    return (
        <div className="bg-gray-100 min-h-screen">
            <main className="flex flex-col gap-8 row-start-2 items-start p-8">
                <h1 className="text-4xl text-black font-bold">Settings</h1>
                <div className="flex flex-row gap-8">
                    <h2 className="text-3xl text-black font-semibold">Role</h2>
                    <Select value={roleSelected} onValueChange={updateStorage}>
                        <SelectTrigger className="w-[180px] bg-[white]">
                            <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                            {roles.map((role) => {
                                return (
                                    <SelectItem key={role.value} value={role.value}>
                                        {role.label}
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </div>
            </main>
        </div>
    );
}
