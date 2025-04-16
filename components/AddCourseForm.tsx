"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Sheet, SheetContent, SheetFooter, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { colorOptions, daysOptions } from "@/lib/constants";

import { addCourse } from "@/services/course";

const schema = z
    .object({
        title: z.string().min(2),
        color: z.string().length(7, "Invalid color"),
        days: z.array(z.string()).min(1, "Select at least one day"),
        startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid Time"),
        endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid Time"),
    })
    .refine((data) => data.startTime < data.endTime, {
        message: "Start time cannot be after end time",
        path: ["startTime"],
    });

interface AddCourseFormProps {
    onCourseAdded?: () => void;
}

export const AddCourseForm = ({ onCourseAdded }: AddCourseFormProps) => {
    const session = useSession();
    const { toast } = useToast();

    const user = session?.data?.user ?? { id: "", firstName: "" };

    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof schema>>({
        mode: "onChange",
        resolver: zodResolver(schema),
        defaultValues: {
            color: colorOptions[0],
            title: "",
            days: [],
            startTime: "",
            endTime: "",
        },
    });

    const handleSubmit = (values: z.infer<typeof schema>) => {
        const { title, color, days, endTime, startTime } = values;
        setLoading(true);
        addCourse(title, days, color, startTime, endTime, user.id)
            .then((result) => {
                setLoading(false);
                if ("error" in result) {
                    return toast({ variant: "destructive", description: result?.error ?? "" });
                }
                form.reset();
                setIsOpen(false);
                onCourseAdded?.();
                return toast({ description: "Course created succesfuly with code " + result.code });
            })
            .catch((err: unknown) => {
                setLoading(false);
                console.error(err);
                return toast({ variant: "destructive", description: "Unknown error occurred" });
            });
    };

    return (
        <Sheet
            open={isOpen}
            onOpenChange={(val) => {
                if (!val) {
                    form.reset(); // Reset form on close
                }
                setIsOpen(val);
            }}
        >
            <SheetTrigger asChild>
                <button className="flex-col w-80 max-w-80 h-56 max-h-56 rounded-md shadow-lg">
                    <div className="bg-primary min-h-[40%] max-h-[40%] w-full rounded-t-md"></div>
                    <div className="h-[60%] max-h-[60%] bg-gray-50 w-full flex items-center justify-center rounded-b-md">
                        <p className="flex text-lg text-center font-medium text-primary gap-1 items-center">
                            Create Course <Plus />
                        </p>
                    </div>
                </button>
                {/* </> */}
            </SheetTrigger>
            <SheetContent className="w-[480px] max-w-full p-8 flex flex-col">
                <SheetTitle className="text-4xl mb-8 font-normal">Create a course</SheetTitle>
                <Form {...form}>
                    <form className="flex-1 flex flex-col justify-between">
                        {/* Avoid form onSubmit due to default form Action behaviour in NextJS.
                        TODO: Use server actions instead */}
                        <div className="flex flex-col gap-8">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                placeholder="Name of Course"
                                                {...field}
                                                className="w-full p-0 pb-1 bg-white text-m text-black focus:outline-none border-b focus:border-b"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="days"
                                render={({ field: { value, onChange } }) => (
                                    <div>
                                        <FormLabel className="block font-normal text-xl mb-2">
                                            Days of the Week:
                                        </FormLabel>
                                        <div className="flex gap-5">
                                            {daysOptions.map((day) => (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    className={`w-11 h-11 rounded-full border border-[hsl(var(--input-border))] ${
                                                        value.includes(day)
                                                            ? "bg-[hsl(var(--primary))] text-[hsl(var(--secondary))]"
                                                            : "bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"
                                                    }`}
                                                    onClick={() => {
                                                        if (value.includes(day)) {
                                                            onChange(
                                                                value.filter(
                                                                    (item) => item !== day,
                                                                ),
                                                            );
                                                            return;
                                                        }
                                                        onChange([...value, day]);
                                                    }}
                                                >
                                                    {day}
                                                </button>
                                            ))}
                                        </div>
                                        <FormMessage className="mt-2" />
                                    </div>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="color"
                                render={({ field: { value, onChange } }) => (
                                    <div>
                                        <FormLabel className="block font-normal text-xl mb-2">
                                            Assign Color:
                                        </FormLabel>
                                        <div className="flex gap-5">
                                            {colorOptions.map((color) => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    className={`w-11 h-11 rounded-full ${
                                                        value === color
                                                            ? "ring-2 ring-[hsl(var(--primary))]"
                                                            : "border border-[hsl(var(--input-border))]"
                                                    }`}
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => {
                                                        onChange(color);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            />
                            <div>
                                <FormLabel className="block font-normal text-xl mb-2">
                                    Times:
                                </FormLabel>
                                <div className="flex gap-4 justify-between items-center">
                                    <FormField
                                        control={form.control}
                                        name="startTime"
                                        render={({ field }) => (
                                            <FormItem className="relative w-full">
                                                <FormControl>
                                                    <Input
                                                        type="time"
                                                        placeholder="00:00"
                                                        {...field}
                                                        className="w-full bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] border border-[hsl(var(--input-border))] rounded-md p-2"
                                                    />
                                                </FormControl>
                                                <FormMessage className="absolute text-nowrap" />
                                            </FormItem>
                                        )}
                                    />
                                    <span className="text-center text-m align-middle">to</span>
                                    <FormField
                                        control={form.control}
                                        name="endTime"
                                        render={({ field }) => (
                                            <FormItem className="relative w-full">
                                                <FormControl>
                                                    <Input
                                                        type="time"
                                                        placeholder="00:00"
                                                        {...field}
                                                        className="w-full bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] border border-[hsl(var(--input-border))] rounded-md p-2"
                                                    />
                                                </FormControl>
                                                <FormMessage className="absolute" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                        <SheetFooter className="flex justify-end">
                            <Button
                                variant="primary"
                                disabled={!form.formState.isValid || loading}
                                size="primary"
                                type="button"
                                onClick={() =>
                                    void form.handleSubmit(handleSubmit, (err) => {
                                        console.error(err);
                                    })()
                                }
                                className="mt-4"
                            >
                                Add Course
                            </Button>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
};
