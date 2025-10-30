import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET - Lấy tất cả recipes
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const recipesCollection = db.collection('recipes')
    
    // Lấy tham số filter
    const status = request.nextUrl.searchParams.get('status')
    const includeAll = request.nextUrl.searchParams.get('includeAll') === 'true'

    let query: any = {}
    
    // Nếu không phải admin (includeAll=false), chỉ lấy recipes đã approved hoặc không có status
    if (!includeAll) {
      query = { $or: [{ status: 'approved' }, { status: { $exists: false } }] }
    } else if (status) {
      // Admin lọc theo status cụ thể
      query = { status }
    }

    const recipes = await recipesCollection.find(query).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({
      success: true,
      recipes: recipes.map((recipe) => ({
        ...recipe,
        id: recipe._id.toString(),
        _id: undefined,
      })),
    })
  } catch (error) {
    console.error('Get recipes error:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy công thức' },
      { status: 500 }
    )
  }
}

// POST - Tạo recipe mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipe, userId, userEmail, isAdmin } = body

    if (!recipe) {
      return NextResponse.json(
        { success: false, error: 'Missing recipe data' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const recipesCollection = db.collection('recipes')

    // Xóa id cũ nếu có, MongoDB sẽ tạo _id mới
    const { id, ...recipeData } = recipe

    const result = await recipesCollection.insertOne({
      ...recipeData,
      // Admin đăng thì approved luôn, user thường thì pending
      status: isAdmin ? 'approved' : 'pending',
      authorId: userId,
      authorEmail: userEmail,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      recipe: {
        ...recipeData,
        id: result.insertedId.toString(),
      },
    })
  } catch (error) {
    console.error('Create recipe error:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tạo công thức' },
      { status: 500 }
    )
  }
}

// PUT - Cập nhật recipe
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipe } = body

    if (!recipe || !recipe.id) {
      return NextResponse.json(
        { success: false, error: 'Missing recipe data or ID' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const recipesCollection = db.collection('recipes')

    const { id, ...recipeData } = recipe

    await recipesCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...recipeData, 
          updatedAt: new Date() 
        } 
      }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update recipe error:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật công thức' },
      { status: 500 }
    )
  }
}

// DELETE - Xóa recipe
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing recipe ID' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const recipesCollection = db.collection('recipes')

    await recipesCollection.deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete recipe error:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi xóa công thức' },
      { status: 500 }
    )
  }
}
