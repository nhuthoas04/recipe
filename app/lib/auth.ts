import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

// Interface cho decoded token
export interface TokenPayload {
  userId: string
  email: string
  name: string
  role: 'user' | 'admin'
  iat: number // issued at
  exp: number // expiration
}

/**
 * Verify JWT token từ cookie hoặc Authorization header
 * @param request - Next.js request object
 * @returns Token payload nếu hợp lệ, null nếu không
 */
export function verifyToken(request: NextRequest): TokenPayload | null {
  try {
    // Lấy token từ cookie
    let token = request.cookies.get('auth-token')?.value

    // Nếu không có trong cookie, thử lấy từ Authorization header
    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7) // Bỏ "Bearer " prefix
      }
    }

    if (!token) {
      return null
    }

    // Verify và decode token
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Tạo JWT token mới
 * @param payload - Dữ liệu cần mã hóa trong token
 * @param expiresIn - Thời gian hết hạn (mặc định 7 ngày)
 * @returns JWT token string
 */
export function createToken(
  payload: { userId: string; email: string; name: string; role: 'user' | 'admin' },
  expiresIn: string | number = '7d'
): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions)
}

/**
 * Kiểm tra xem user có phải admin không
 * @param request - Next.js request object
 * @returns true nếu là admin, false nếu không
 */
export function isAdmin(request: NextRequest): boolean {
  const tokenPayload = verifyToken(request)
  return tokenPayload?.role === 'admin'
}

/**
 * Middleware để bảo vệ admin routes
 * @param request - Next.js request object
 * @returns null nếu là admin, Response 403 nếu không
 */
export function requireAdmin(request: NextRequest): NextResponse | null {
  const tokenPayload = verifyToken(request)
  
  if (!tokenPayload) {
    return NextResponse.json(
      { success: false, error: 'Vui lòng đăng nhập' },
      { status: 401 }
    )
  }
  
  if (tokenPayload.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Chỉ admin mới có quyền truy cập' },
      { status: 403 }
    )
  }
  
  return null
}
