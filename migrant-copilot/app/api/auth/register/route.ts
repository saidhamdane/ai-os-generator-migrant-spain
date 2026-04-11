import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, password, locale } = await req.json()

    if (!email || !password || password.length < 8) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      return NextResponse.json(
        { error: locale === 'ar' ? 'البريد الإلكتروني مستخدم بالفعل' : 'Email ya registrado' },
        { status: 409 }
      )
    }

    const passwordHash = await hash(password, 12)

    await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        fullName: fullName || null,
        preferredLanguage: locale === 'es' ? 'es' : 'ar',
      },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
