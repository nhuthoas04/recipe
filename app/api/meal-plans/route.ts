import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET - Lấy meal plans của user
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
    const mealPlansCollection = db.collection('meal_plans')

    const mealPlans = await mealPlansCollection
      .find({ userId })
      .sort({ date: 1 })
      .toArray()

    return NextResponse.json({
      success: true,
      mealPlans: mealPlans.map((plan) => {
        const { _id, ...rest } = plan
        return {
          ...rest,
          id: rest.id || _id.toString(), // Ưu tiên dùng id có sẵn, không thì dùng _id
        }
      }),
    })
  } catch (error) {
    console.error('Get meal plans error:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy thực đơn' },
      { status: 500 }
    )
  }
}

// POST - Tạo meal plan mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, mealPlan } = body

    if (!userId || !mealPlan) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const mealPlansCollection = db.collection('meal_plans')

    const result = await mealPlansCollection.insertOne({
      ...mealPlan,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      mealPlan: {
        ...mealPlan,
        id: result.insertedId.toString(),
      },
    })
  } catch (error) {
    console.error('Create meal plan error:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tạo thực đơn' },
      { status: 500 }
    )
  }
}

// PUT - Cập nhật meal plan
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, mealPlanId, updates } = body

    if (!userId || !mealPlanId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const mealPlansCollection = db.collection('meal_plans')

    // Thử tìm theo cả id và _id
    let query: any = { userId }
    
    // Nếu mealPlanId là ObjectId hợp lệ
    if (ObjectId.isValid(mealPlanId) && mealPlanId.length === 24) {
      query._id = new ObjectId(mealPlanId)
    } else {
      // Tìm theo field id
      query.id = mealPlanId
    }

    const result = await mealPlansCollection.updateOne(
      query,
      { $set: { ...updates, updatedAt: new Date() } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Meal plan not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update meal plan error:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật thực đơn' },
      { status: 500 }
    )
  }
}

// DELETE - Xóa meal plan
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const mealPlanId = request.nextUrl.searchParams.get('mealPlanId')

    if (!userId || !mealPlanId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const mealPlansCollection = db.collection('meal_plans')

    // Thử tìm theo cả id và _id
    let query: any = { userId }
    
    // Nếu mealPlanId là ObjectId hợp lệ
    if (ObjectId.isValid(mealPlanId) && mealPlanId.length === 24) {
      query._id = new ObjectId(mealPlanId)
    } else {
      // Tìm theo field id
      query.id = mealPlanId
    }

    const result = await mealPlansCollection.deleteOne(query)

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Meal plan not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete meal plan error:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi xóa thực đơn' },
      { status: 500 }
    )
  }
}
