import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDatabase } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập đầy đủ thông tin' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const usersCollection = db.collection('users')

    // Find user by email
    const user = await usersCollection.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      )
    }

    // Check if account is locked
    if (user.isActive === false) {
      return NextResponse.json(
        { success: false, error: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin.' },
        { status: 403 }
      )
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password as string)

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      )
    }

    // Return user info (without password)
    const userInfo = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    }

    return NextResponse.json({
      success: true,
      user: userInfo,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi đăng nhập' },
      { status: 500 }
    )
  }
}
