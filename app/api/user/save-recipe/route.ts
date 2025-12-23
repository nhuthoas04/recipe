import { NextRequest, NextResponse } from 'next/server';

// Use internal Docker network URL for server-side requests
const BACKEND_URL = process.env.INTERNAL_API_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipeId } = body;

    const token = request.headers.get('Authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value;

    console.log('[save-recipe] recipeId:', recipeId, 'token exists:', !!token);

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Forward to backend
    const response = await fetch(`${BACKEND_URL}/api/users/save-recipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ recipeId }),
    });

    const data = await response.json();
    console.log('[save-recipe] Backend response:', data);
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('[save-recipe] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
