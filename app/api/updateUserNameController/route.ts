import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// Define the expected shape of the request body using Zod.
const nameRegex = /^[A-Za-z\s'-]+$/;

const updateUserNameSchema = z.object({
    firstName: z
        .string()
        .min(1, "First name is required")
        .regex(nameRegex, "First name must contain only letters, spaces, apostrophes, or hyphens"),
    lastName: z
        .string()
        .min(1, "Last name is required")
        .regex(nameRegex, "Last name must contain only letters, spaces, apostrophes, or hyphens"),
});

export async function GET() {
    try {
        // Get the server session to authenticate the request.
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch the user's current name from the database.
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { firstName: true, lastName: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        // Authenticate the request.
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse and validate the request body using Zod.
        const body = await request.json();
        const parsed = updateUserNameSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid input", details: parsed.error.flatten() },
                { status: 400 },
            );
        }
        const { firstName, lastName } = parsed.data;

        // Update the user record in the database.
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: { firstName, lastName },
            select: { firstName: true, lastName: true },
        });

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.error("Error updating user name:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
