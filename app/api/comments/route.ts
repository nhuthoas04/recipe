import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// GET - Lấy comments của một recipe (bao gồm nested replies)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const recipeId = searchParams.get("recipeId")
    const countOnly = searchParams.get("countOnly") // Chỉ lấy số lượng

    if (!recipeId) {
      return NextResponse.json(
        { success: false, error: "Recipe ID is required" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("recipe-app")
    
    // Nếu chỉ cần đếm số lượng
    if (countOnly === "true") {
      const count = await db
        .collection("comments")
        .countDocuments({ recipeId, parentId: { $exists: false } })
      
      const repliesCount = await db
        .collection("comments")
        .countDocuments({ recipeId, parentId: { $exists: true } })
      
      return NextResponse.json({
        success: true,
        count: count + repliesCount,
        commentsCount: count,
        repliesCount: repliesCount,
      })
    }
    
    // Lấy tất cả comments (cả parent và replies)
    const allComments = await db
      .collection("comments")
      .find({ recipeId })
      .sort({ createdAt: -1 })
      .toArray()

    // Tách parent comments và replies
    const parentComments: any[] = []
    const repliesMap: { [key: string]: any[] } = {}

    allComments.forEach(comment => {
      const formattedComment = {
        id: comment._id.toString(),
        recipeId: comment.recipeId,
        userId: comment.userId,
        userName: comment.userName,
        userEmail: comment.userEmail,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        likes: comment.likes || [],
        likesCount: (comment.likes || []).length,
        parentId: comment.parentId,
      }

      if (comment.parentId) {
        // Là reply
        if (!repliesMap[comment.parentId]) {
          repliesMap[comment.parentId] = []
        }
        repliesMap[comment.parentId].push(formattedComment)
      } else {
        // Là parent comment
        parentComments.push(formattedComment)
      }
    })

    // Gắn replies vào parent comments
    const commentsWithReplies = parentComments.map(comment => ({
      ...comment,
      replies: (repliesMap[comment.id] || []).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    }))

    return NextResponse.json({
      success: true,
      comments: commentsWithReplies,
      totalCount: allComments.length,
    })
  } catch (error: any) {
    console.error("Get comments error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Tạo comment mới (hoặc reply)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { recipeId, userId, userName, userEmail, content, parentId } = body

    if (!recipeId || !userId || !userName || !content) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Comment cannot be empty" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("recipe-app")

    // Nếu là reply, kiểm tra parent comment có tồn tại không
    if (parentId) {
      const parentComment = await db.collection("comments").findOne({
        _id: new ObjectId(parentId),
      })
      if (!parentComment) {
        return NextResponse.json(
          { success: false, error: "Parent comment not found" },
          { status: 404 }
        )
      }
    }

    const newComment: any = {
      recipeId,
      userId,
      userName,
      userEmail,
      content: content.trim(),
      createdAt: new Date(),
      likes: [],
    }

    // Nếu là reply, thêm parentId
    if (parentId) {
      newComment.parentId = parentId
    }

    const result = await db.collection("comments").insertOne(newComment)

    return NextResponse.json({
      success: true,
      comment: {
        id: result.insertedId.toString(),
        ...newComment,
        likesCount: 0,
      },
    })
  } catch (error: any) {
    console.error("Create comment error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Xóa comment
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get("id")
    const userId = searchParams.get("userId")
    const userEmail = searchParams.get("userEmail") // Thêm email để kiểm tra admin

    console.log("DELETE request:", { commentId, userId, userEmail })

    if (!commentId || !userId) {
      return NextResponse.json(
        { success: false, error: "Comment ID and User ID are required" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("recipe-app")

    // Kiểm tra comment có tồn tại không
    const comment = await db.collection("comments").findOne({
      _id: new ObjectId(commentId),
    })

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 }
      )
    }

    // Kiểm tra quyền: admin (theo email) hoặc chủ comment
    const isAdmin = userEmail === "admin@recipe.com"
    const isOwner = comment.userId === userId

    console.log("Authorization check:", {
      commentId,
      commentUserId: comment.userId,
      requestUserId: userId,
      userEmail,
      isAdmin,
      isOwner,
      canDelete: isAdmin || isOwner
    })

    // Admin hoặc chủ comment có quyền xóa
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Bạn không có quyền xóa bình luận này" },
        { status: 403 }
      )
    }

    await db.collection("comments").deleteOne({
      _id: new ObjectId(commentId),
    })

    console.log("Comment deleted successfully:", commentId)

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
    })
  } catch (error: any) {
    console.error("Delete comment error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT - Sửa comment
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { commentId, userId, content } = body

    if (!commentId || !userId || !content) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Comment cannot be empty" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("recipe-app")

    // Kiểm tra comment có tồn tại và thuộc về user không
    const comment = await db.collection("comments").findOne({
      _id: new ObjectId(commentId),
    })

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 }
      )
    }

    if (comment.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      )
    }

    await db.collection("comments").updateOne(
      { _id: new ObjectId(commentId) },
      {
        $set: {
          content: content.trim(),
          updatedAt: new Date(),
        },
      }
    )

    return NextResponse.json({
      success: true,
      message: "Comment updated successfully",
    })
  } catch (error: any) {
    console.error("Update comment error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PATCH - Like/unlike comment
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { commentId, userId, action } = body

    if (!commentId || !userId) {
      return NextResponse.json(
        { success: false, error: "Comment ID and User ID are required" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("recipe-app")

    const comment = await db.collection("comments").findOne({
      _id: new ObjectId(commentId),
    })

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 }
      )
    }

    const currentLikes = comment.likes || []
    const hasLiked = currentLikes.includes(userId)
    
    let updateOperation
    if (hasLiked) {
      // Unlike - remove userId from likes array
      updateOperation = { $pull: { likes: userId } }
    } else {
      // Like - add userId to likes array
      updateOperation = { $addToSet: { likes: userId } }
    }

    await db.collection("comments").updateOne(
      { _id: new ObjectId(commentId) },
      updateOperation
    )

    const newLikesCount = hasLiked ? currentLikes.length - 1 : currentLikes.length + 1

    return NextResponse.json({
      success: true,
      isLiked: !hasLiked,
      likesCount: newLikesCount,
    })
  } catch (error: any) {
    console.error("Like comment error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
