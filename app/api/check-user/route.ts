// app/api/auth/callback/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
    const searchParams = new URL(request.url).searchParams
    const email = searchParams.get('email')

    if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        // Return the redirect URL based on whether user exists
        return NextResponse.json({
            redirectUrl: existingUser ? '/dashboard' : '/signup/name'
        })
    } catch (error) {
        console.error('Error in auth callback:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}