import { NextRequest, NextResponse } from 'next/server';

// Use internal Docker network URL for server-side requests
const BACKEND_URL = process.env.INTERNAL_API_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Forward to backend
    const response = await fetch(`${BACKEND_URL}/api/users/liked-recipes`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    // Format recipes để đúng cấu trúc frontend
    if (data.success && data.recipes) {
      data.recipes = data.recipes.map((recipe: any) => ({
        ...recipe,
        name: recipe.name || recipe.title,
        image: recipe.image || recipe.imageUrl,
        likesCount: recipe.likesCount || 0,
        savesCount: recipe.savesCount || 0,
      }));
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
