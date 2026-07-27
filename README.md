# NOIR — Personal Profile Platform

NOIR là nền tảng profile cá nhân full-stack theo phong cách dark, glassmorphism tối giản. Mỗi người dùng sở hữu đường dẫn `/@username`, quản lý thông tin, liên kết, dự án, giao diện, nhạc nền, bạn bè và trò chuyện realtime trong dashboard.

## Công nghệ

- Frontend: React 18, Vite, Tailwind CSS, React Router DOM, Framer Motion, Lucide React, Axios, Socket.IO Client.
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Cloudinary, Multer, Socket.IO.
- Bảo mật: HTTP-only cookie, Helmet, CORS allowlist, rate limiting, validation, ownership checks và IP hashing.

## Tính năng

- Đăng ký, đăng nhập, ghi nhớ phiên, đổi mật khẩu và vô hiệu hóa tài khoản.
- Profile công khai tại `/@username`, responsive từ 320px, animation tôn trọng `prefers-reduced-motion`.
- Quản lý profile, avatar, ảnh nền, kỹ năng, mạng xã hội và dự án.
- Bộ sưu tập game đã chơi với catalog Steam/Riot Games, số giờ, rank, trạng thái, yêu thích và kéo-thả thứ tự.
- Tùy chỉnh màu sắc, nền, blur, card, font, hiệu ứng, nhạc và âm lượng.
- Thống kê lượt xem ẩn danh, không lưu IP thô.
- Kết bạn, duyệt lời mời và chat realtime kênh thế giới.
- Loading, toast, trạng thái trống, xác nhận xóa, 404 và Error Boundary.

## Cấu trúc

```text
personal-profile/
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── routes/
│   ├── .env.example
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── .env.example
│   └── package.json
└── README.md
```

## Chạy development

Yêu cầu Node.js 22.22+ (khuyến nghị Node.js 24), npm và một MongoDB database.

Backend:

```bash
cd server
copy .env.example .env
npm install
npm run dev
```

Frontend (terminal khác):

```bash
cd client
copy .env.example .env
npm install
npm run dev
```

Mở `http://localhost:5173`.

## Biến môi trường

Backend, file `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
JWT_SECRET=chuoi_ngau_nhien_dai_va_bao_mat
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
IP_HASH_SECRET=chuoi_ngau_nhien_khac
```

Frontend, file `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Không commit file `.env`.

Chỉ đặt `VITE_API_URL` trong `client/.env`. Tất cả thông tin MongoDB, JWT,
Cloudinary và khóa băm IP chỉ được phép tồn tại trong `server/.env` hoặc kho
biến môi trường bí mật của nền tảng triển khai. Backend sẽ từ chối khởi động
nếu thiếu biến bắt buộc hoặc khóa production không đủ an toàn.

## MongoDB Atlas

1. Tạo project và cluster miễn phí tại MongoDB Atlas.
2. Trong **Database Access**, tạo database user với mật khẩu mạnh.
3. Trong **Network Access**, cho phép IP máy phát triển; khi deploy chỉ cho phép hạ tầng cần thiết nếu nhà cung cấp có IP cố định.
4. Chọn **Connect → Drivers**, sao chép connection string và thay username, password, database name.
5. Gán chuỗi hoàn chỉnh cho `MONGODB_URI`.

Mongoose tự tạo collection và index khi ứng dụng/seed chạy.

## Cloudinary

1. Tạo tài khoản Cloudinary và mở Dashboard.
2. Sao chép Cloud Name, API Key và API Secret vào ba biến `CLOUDINARY_*` ở backend.
3. Không đặt API Secret ở frontend.
4. Upload được giới hạn 5 MB cho ảnh và 15 MB cho nhạc; ảnh chỉ nhận JPG, PNG, WebP, GIF.

## Dữ liệu demo

Sau khi MongoDB và `.env` đã cấu hình:

```bash
cd server
npm run seed
```

- Email: `demo@example.com`
- Password: `Demo@123456`
- Username: `demo`
- Profile: `http://localhost:5173/@demo`

Seed có thể chạy lại an toàn; dữ liệu demo chính không bị nhân bản.

## Build production

```bash
cd client
npm run build
```

Backend chạy production:

```bash
cd server
set NODE_ENV=production
npm start
```

## Deploy frontend lên Vercel

1. Push thư mục dự án lên GitHub và import repository vào Vercel.
2. Đặt **Root Directory** là `personal-profile/client`.
3. Build command: `npm run build`; output directory: `dist`.
4. Thêm `VITE_API_URL=https://your-api.onrender.com/api`.
5. Tạo rewrite SPA trong Vercel nếu cấu hình tự động của Vite chưa xử lý các route trực tiếp.
6. Deploy, sau đó cập nhật `CLIENT_URL` của backend bằng domain Vercel chính xác.

## Deploy backend lên Render

1. Tạo **Web Service** từ repository.
2. Root Directory: `personal-profile/server`.
3. Build command: `npm install`; start command: `npm start`.
4. Thêm toàn bộ biến backend. Đặt `NODE_ENV=production` và `CLIENT_URL=https://your-app.vercel.app`.
5. Dùng MongoDB Atlas thay vì database cục bộ.
6. Sau deploy, kiểm tra `https://your-api.onrender.com/api/health`.

Cookie production dùng `secure` và `sameSite=none`, vì vậy frontend/backend phải chạy HTTPS. Nếu dùng nhiều frontend origin, phân cách `CLIENT_URL` bằng dấu phẩy.

## API

Tất cả API dùng tiền tố `/api`. Nhóm route chính: `/auth`, `/profile`, `/social-links`, `/projects`, `/games`, `/appearance`, `/community`. Các endpoint thay đổi dữ liệu cá nhân đều yêu cầu phiên đăng nhập và lọc theo `userId`.

Catalog game gồm các tựa phổ biến trên Steam và danh mục chính thức của Riot Games. Đây là catalog nội bộ để người dùng chọn nhanh; ứng dụng không yêu cầu Steam API key hoặc Riot API key và không tự động đọc lịch sử tài khoản game.

## Ghi chú nhạc

Trang giao diện có ba track royalty-free để thử luồng chọn nhạc và hỗ trợ upload nhạc riêng lên Cloudinary. Trong sản phẩm thương mại, chỉ sử dụng nhạc có bản quyền phù hợp hoặc tích hợp một nhà cung cấp streaming có API/giấy phép; không tự động phát trước tương tác của khách.
