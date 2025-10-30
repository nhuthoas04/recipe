import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET - Lấy danh sách users (chỉ admin)
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const usersCollection = db.collection('users')

    const users = await usersCollection
      .find({}, { projection: { password: 0 } }) // Không trả về password
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      success: true,
      users: users.map((user) => ({
        ...user,
        id: user._id.toString(),
      })),
    })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy danh sách người dùng' },
      { status: 500 }
    )
  }
}

// PUT - Cập nhật user (khóa/mở khóa tài khoản)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, updates } = body

    if (!userId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const usersCollection = db.collection('users')

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { ...updates, updatedAt: new Date() } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật người dùng' },
      { status: 500 }
    )
  }
}

// DELETE - Xóa user
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const usersCollection = db.collection('users')

    // Không cho phép xóa admin
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) })
    if (user?.email === 'admin@recipe.com') {
      return NextResponse.json(
        { success: false, error: 'Không thể xóa tài khoản admin' },
        { status: 403 }
      )
    }

    await usersCollection.deleteOne({ _id: new ObjectId(userId) })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi xóa người dùng' },
      { status: 500 }
    )
  }
}
