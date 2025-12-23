import { NextRequest, NextResponse } from 'next/server';

// Use internal Docker network URL for server-side requests
const BACKEND_URL = process.env.INTERNAL_API_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Forward to backend
    const response = await fetch(`${BACKEND_URL}/api/users/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('[forgot-password] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
