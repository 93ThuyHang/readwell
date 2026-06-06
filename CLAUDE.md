# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tổng quan dự án

**Readwell** là ứng dụng nhật ký đọc sách tiếng Việt, nơi người dùng có thể tạo và chia sẻ bài đánh giá sách, tương tác với các trích dẫn, và kết nối với cộng đồng đọc sách. Dự án gồm hai phần chính:

- **Backend**: Next.js API server với PostgreSQL và Prisma ORM, chạy trên cổng 5000
- **Frontend**: Nuxt 3 Vue với Tailwind CSS, chạy trên cổng 3000

Backend còn tích hợp trang quản trị (admin panel) để quản lý bài viết, danh mục, bình luận và thống kê.

## Công nghệ sử dụng

### Backend
- **Framework**: Next.js 14 (API routes + React Admin UI)
- **Cơ sở dữ liệu**: PostgreSQL 16
- **ORM**: Prisma 7.8 với `@prisma/adapter-pg`
- **Xác thực**: JWT (jose) + bcryptjs
- **Rich Text**: TipTap editor

### Frontend
- **Framework**: Nuxt 3 / Vue 3
- **Styling**: Tailwind CSS với bảng màu đất ấm tùy chỉnh (bg, ink, rust, border)
- **Icons**: lucide-vue-next
- **Font**: Lora (serif), Nunito (sans), Playfair Display (display)

### Hạ tầng
- **Container**: Docker + Docker Compose
- **Cổng DB**: 5433 (ánh xạ từ PostgreSQL 5432)
- **Admin URL**: `http://localhost:5000/admin`
- **Frontend URL**: `http://localhost:3000`

## Khởi chạy

### Dùng Docker Compose (khuyến nghị)
```bash
docker-compose up --build
```
Tự động khởi động PostgreSQL, backend và frontend. Seed data được áp dụng lần đầu chạy.

### Phát triển cục bộ

```bash
cd backend && npm install
cd ../frontend && npm install
```

Tạo file `.env` cho từng phần:
- Backend: `DATABASE_URL`, `JWT_SECRET`
- Frontend: `BACKEND_URL=http://localhost:5000`

Chạy migration và seed:
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

Khởi chạy hai server:
```bash
# Terminal 1 - Backend (cổng 5000)
cd backend && npm run dev

# Terminal 2 - Frontend (cổng 3000)
cd frontend && npm run dev
```

## Lệnh thường dùng

### Backend
```bash
npm run dev       # Dev server cổng 5000
npm run build     # Build production
npm start         # Chạy production
```

### Frontend
```bash
npm run dev       # Dev server cổng 3000 (host 0.0.0.0)
npm run build     # Build production
npm run preview   # Xem trước bản build
npm run generate  # Xuất static site
```

### Cơ sở dữ liệu
```bash
# Chạy từ thư mục /backend
npx prisma migrate dev     # Tạo và áp dụng migration
npx prisma db seed         # Nạp dữ liệu mẫu
npx prisma studio          # Giao diện GUI (localhost:5555)
npx prisma generate        # Tạo lại Prisma client sau khi sửa schema
```

Dữ liệu seed bao gồm 4 bài viết đánh giá sách tiếng Việt, thống kê (31 sách, 47 đánh giá, 12 video), trích dẫn nổi bật và tài khoản admin `readwellAdmin`.

## Schema cơ sở dữ liệu

- **Post**: Bài viết với slug (unique), tiêu đề, danh mục, tác giả, nội dung dạng JSON (paragraphs), embeds (quote/book/video JSON), hashtags, số lượt thích/bình luận
- **Comment**: Bình luận trên bài viết (cascade delete theo postId)
- **Category**: Danh mục bài viết với slug unique và màu tùy chỉnh
- **Stats**: Bản ghi duy nhất theo dõi số lượng sách/đánh giá/video
- **FeaturedQuote**: Bản ghi duy nhất cho trích dẫn nổi bật trang chủ
- **AdminUser**: Thông tin đăng nhập admin (username unique, mật khẩu bcrypt)

**Lưu ý**: Trường `videoEmbed` của Post yêu cầu dùng raw SQL (`$queryRaw`, `$executeRaw`) do vấn đề cache Prisma client. Luôn chạy `npx prisma generate` sau khi sửa schema.

## API Endpoints

Tất cả endpoint từ backend cổng 5000, được proxy qua frontend tại `/api/**`.

### Public
- `GET /api/posts` — Lấy tất cả bài viết (kèm raw SQL cho videoEmbed)
- `GET /api/posts/[slug]` — Lấy bài viết theo slug
- `POST /api/posts/[slug]/like` — Tăng lượt thích
- `GET/POST /api/posts/[slug]/comments` — Lấy và gửi bình luận
- `GET /api/categories` — Lấy danh mục
- `GET /api/stats` — Lấy thống kê và trích dẫn nổi bật

### Admin (yêu cầu xác thực)
- `POST /api/admin/login` — Đăng nhập JWT (đặt cookie httpOnly `admin_session`)
- `POST /api/admin/logout` — Xóa cookie phiên
- `GET/POST/PUT/DELETE /api/posts` — CRUD bài viết
- `GET/PUT/DELETE /api/categories/[id]` — Quản lý danh mục
- `GET/PUT/DELETE /api/comments/[id]` — Kiểm duyệt bình luận

**Luồng xác thực**: JWT lưu trong cookie httpOnly `admin_session`, hết hạn sau 8 giờ. Middleware tại `src/middleware.ts` bảo vệ các route `/admin/*`.

## Frontend

`usePosts()` composable fetch song song `/api/posts` và `/api/stats` khi tải trang. Bài viết hiển thị dưới dạng card với tiêu đề, tác giả, danh mục, thời gian đọc, đoạn trích, và các embed (quote/book/video).

Proxy Nuxt định tuyến `/api/**` đến `BACKEND_URL`. Trong Docker, dùng `http://backend:5000`.

## Admin Panel

**Routes**: `/admin/login` → `/admin` (dashboard) → `/admin/posts`, `/admin/categories`, `/admin/comments`, `/admin/stats`

Dùng React TSX qua Next.js App Router. Editor bài viết dùng TipTap (RichTextEditor.tsx). Thông báo giao diện bằng tiếng Việt.

## Cấu trúc thư mục

```
/backend
  /src
    /app
      /api              # Route handlers REST
      /admin            # Trang quản trị (được bảo vệ)
    /lib                # Tiện ích dùng chung (auth.js, prisma.js)
    middleware.ts       # Xác thực JWT cho /admin
  /prisma
    schema.prisma
    seed.ts
    migrations/
  next.config.mjs       # Cấu hình CORS

/frontend
  /pages
    index.vue           # Trang chủ
  /components           # Component Vue tái sử dụng
  /composables          # usePosts composable
  /layouts
    default.vue
  nuxt.config.ts        # Proxy rules, fonts, meta
  tailwind.config.js    # Bảng màu tùy chỉnh
```
