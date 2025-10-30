import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET - Lấy shopping list của user
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const shoppingCollection = db.collection('shopping_lists')

    const shoppingList = await shoppingCollection.findOne({ userId })

    return NextResponse.json({
      success: true,
      items: shoppingList?.items || [],
    })
  } catch (error) {
    console.error('Get shopping list error:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy danh sách mua sắm' },
      { status: 500 }
    )
  }
}

// POST - Cập nhật shopping list
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, items } = body

    if (!userId || !items) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const shoppingCollection = db.collection('shopping_lists')

    await shoppingCollection.updateOne(
      { userId },
      {
        $set: {
          items,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update shopping list error:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật danh sách mua sắm' },
      { status: 500 }
    )
  }
}

// PUT - Cập nhật shopping list (tương tự POST)
export async function PUT(request: NextRequest) {
  return POST(request)
}

// DELETE - Xóa shopping list
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const shoppingCollection = db.collection('shopping_lists')

    await shoppingCollection.updateOne(
      { userId },
      {
        $set: {
          items: [],
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Clear shopping list error:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi xóa danh sách mua sắm' },
      { status: 500 }
    )
  }
}
