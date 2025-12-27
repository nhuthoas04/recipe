"use client"

import Link from "next/link"
import { ChefHat, Facebook, Instagram, Github, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Về Bếp Nhà */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <ChefHat className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-primary">Bếp Nhà</h1>
                
              </div>
            </Link>
            <p className="text-sm text-muted-foreground mt-2">
              Hệ thống gợi ý công thức nấu ăn và lập thực đơn cho gia đình Việt.
            </p>
          </div>

          {/* Liên kết nhanh */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Công thức
                </Link>
              </li>
              <li>
                <Link href="/meal-planner" className="text-muted-foreground hover:text-primary transition-colors">
                  Thực đơn
                </Link>
              </li>
              <li>
                <Link href="/shopping-list" className="text-muted-foreground hover:text-primary transition-colors">
                  Danh sách mua sắm
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-muted-foreground hover:text-primary transition-colors">
                  Tài khoản
                </Link>
              </li>
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/forgot-password" className="text-muted-foreground hover:text-primary transition-colors">
                  Quên mật khẩu
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">
                  Đăng nhập
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-muted-foreground hover:text-primary transition-colors">
                  Đăng ký
                </Link>
              </li>
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href="mailto:nhuthoas04@gmail.com" className="hover:text-primary transition-colors">
                  nhuthoas04@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>0912 534 571 </span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Việt Nam</span>
              </li>
            </ul>
            
            {/* Social Media */}
            <div className="flex gap-3 mt-4">
              <a 
                href="https://www.facebook.com/nhathoa.nguyen.2711" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://www.instagram.com/nhhoas_/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://github.com/nhuthoas04" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>© {currentYear} Bếp Nhà. Nguyen Nhut Hoa.</p>
        </div>
      </div>
    </footer>
  )
}
