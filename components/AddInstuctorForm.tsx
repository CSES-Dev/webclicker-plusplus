"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { GlobalLoadingSpinner } from "./ui/global-loading-spinner";
import { Input } from "./ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { addUserToCourseByEmail, getInstructorsForCourse } from "@/services/userCourse";

const schema = z.object({
    email: z.string().email("Not a valid email"),
});

export const AddInstructorForm = () => {
    const params = useParams();
    const session = useSession();
    const { toast } = useToast();

    const courseId = +(params.courseId as string);

    const [instructors, setInstructors] = useState<{ user: User }[]>([]);
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof schema>>({
        mode: "onChange",
        resolver: zodResolver(schema),
        defaultValues: {
            email: "",
        },
    });

    const getInstructors = async () => {
        setLoading(true);
        await getInstructorsForCourse(courseId)
            .then((data) => {
                setInstructors(data);
            })
            .catch((err: unknown) => {
                console.error(err);
                return toast({
                    variant: "destructive",
                    description: "Could not fetch instructor details",
                });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleSubmit = (values: z.infer<typeof schema>) => {
        setLoading(true);
        addUserToCourseByEmail(courseId, values.email, "LECTURER")
            .then(async (result) => {
                setLoading(false);
                if (result && "error" in result) {
                    return toast({ variant: "destructive", description: result?.error ?? "" });
                }
                form.reset();
                await getInstructors();
                return toast({ description: "Instructor added to course" });
            })
            .catch((err: unknown) => {
                setLoading(false);
                console.error(err);
                return toast({ variant: "destructive", description: "Unknown error occurred" });
            });
    };

    useEffect(() => {
        void getInstructors();
    }, [courseId]);

    if (loading) return <GlobalLoadingSpinner />;

    return (
        <div className="self-start flex flex-col gap-4">
            <h2 className="text-2xl font-semibold">Instructors</h2>
            <ol className="space-y-2">
                {instructors.map(({ user }) => (
                    <li key={user.id} className="list-decimal list-inside text-lg">
                        {user.firstName} {user.lastName}{" "}
                        {user.id === session.data?.user.id
                            ? "(You)"
                            : user.email
                              ? "(" + user.email + ")"
                              : ""}
                    </li>
                ))}
            </ol>
            <Form {...form}>
                <form className="flex flex-col md:flex-row gap-8">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        placeholder="Email of instructor"
                                        {...field}
                                        type="email"
                                        className="w-full p-0 pb-1 bg-white text-m text-black focus:outline-none border-b focus:border-b"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        variant="outline"
                        onClick={() => {
                            void form.handleSubmit(handleSubmit, (err) => {
                                console.error(err);
                            })();
                        }}
                    >
                        Add Instructor +
                    </Button>
                </form>
            </Form>
        </div>
    );
};
