import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust path as needed
import prisma from "@/lib/prisma";

export async function PUT() {
  try {
    // 1. Authenticate the request.
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Update the user record, setting finishedOnboarding to true.
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { finishedOnboarding: true },
    });

    // 3. Return success.
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error updating onboarding:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
