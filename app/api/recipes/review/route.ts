import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// POST - Duyệt hoặc từ chối recipe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipeId, action, note } = body // action: 'approve' | 'reject'

    if (!recipeId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const recipesCollection = db.collection('recipes')

    const status = action === 'approve' ? 'approved' : 'rejected'

    await recipesCollection.updateOne(
      { _id: new ObjectId(recipeId) },
      {
        $set: {
          status,
          reviewedAt: new Date(),
          reviewNote: note || '',
          updatedAt: new Date(),
        },
      }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Review recipe error:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi kiểm duyệt công thức' },
      { status: 500 }
    )
  }
}
