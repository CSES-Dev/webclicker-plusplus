"use client";

import React from "react";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

export default function page() {
    return (
        <Drawer>
            <DrawerTrigger className="py-3 px-10 m-3 bg-[#18328D] text-white rounded-lg">
                Add Question
            </DrawerTrigger>
            <DrawerContent className="h-full top-0 right-0 left-auto bottom-auto w-[75%] mt-0 px-16 fixed rounded-none">
                <DrawerHeader className="pt-10">
                    <DrawerTitle className="text-3xl mb-5 font-normal">Add a Question:</DrawerTitle>
                    <DrawerDescription></DrawerDescription>
                </DrawerHeader>
                <DrawerFooter className="mb-6">
                    <Button className="w-36 bg-[#18328D] h-10">Save Question</Button>
                    <DrawerClose></DrawerClose> {/*create drawer close button at top right*/}
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
