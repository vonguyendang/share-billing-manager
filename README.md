# Share Billing Manager

Dự án MVP quản lý chia sẻ chi phí gia đình trên Cloudflare Pages (Chi phí 0 đồng).

## Kiến trúc
- **Frontend:** Vanilla JS, HTML, CSS.
- **Backend:** Cloudflare Pages Functions (TypeScript).
- **Database:** Cloudflare D1 (SQLite).
- **Email:** Google Apps Script Webhook (gửi qua Gmail cá nhân).

## Hướng dẫn triển khai miễn phí

### 1. Chuẩn bị tài khoản
- Tài khoản Cloudflare (Miễn phí)
- Tài khoản GitHub
- Tài khoản Google (để dùng Apps Script gửi email)

### 2. Triển khai Database (Cloudflare D1)
1. Cài đặt Wrangler CLI: `npm install -g wrangler`
2. Đăng nhập: `wrangler login`
3. Tạo database: `wrangler d1 create billing-manager-db`
4. Copy `database_id` từ kết quả trả về và dán vào file `wrangler.toml`.
5. Chạy migration tạo bảng: `wrangler d1 execute billing-manager-db --remote --file=./migrations/0001_initial.sql`
6. (Tùy chọn) Đổ dữ liệu mẫu: `wrangler d1 execute billing-manager-db --remote --file=./migrations/0002_seed.sql`

### 3. Thiết lập Google Apps Script (Email Webhook)
1. Truy cập [script.google.com](https://script.google.com/) tạo project mới.
2. Copy code từ `scripts/webhook.gs` dán vào.
3. Đổi biến `SECRET_KEY` thành một chuỗi ngẫu nhiên khó đoán (VD: `my-super-secret-123`).
4. Bấm nút **Deploy > New deployment**.
5. Chọn loại **Web app**. Execute as: **Me**. Who has access: **Anyone**.
6. Deploy và cấp quyền (Authorize).
7. Copy **Web app URL**.

### 4. Triển khai Cloudflare Pages
1. Push toàn bộ code lên GitHub repo.
2. Vào Cloudflare Dashboard > Pages > Create a project > Connect to Git.
3. Chọn repo `share-billing-manager`.
4. Build settings:
   - Framework preset: `None`
   - Build command: Để trống
   - Build output directory: `public`
5. **Quan trọng:** Cấu hình D1 binding và Environment Variables trước khi lưu và deploy.

#### Cấu hình D1 Binding
- Vào Settings của Pages project > Bindings > Thêm D1 Database:
  - Variable name: `DB`
  - D1 Database: Chọn database đã tạo ở bước 2.

#### Cấu hình Environment Variables
- Thêm các biến sau vào Settings > Environment Variables (cả Production và Preview):
  - `APP_URL`: URL trang web của bạn (VD: `https://your-app.pages.dev`).
  - `ADMIN_PASSWORD_HASH`: Mã băm SHA-256 của mật khẩu admin (Có thể dùng công cụ online để tạo hash cho mật khẩu của bạn).
  - `ADMIN_COOKIE_SECRET`: Một chuỗi ngẫu nhiên dài dùng làm session.
  - `GAS_WEBHOOK_URL`: Link Web app URL ở bước 3.
  - `GAS_WEBHOOK_SECRET`: Chuỗi secret đã tạo ở bước 3.

### 5. Vận hành (Lazy Reminder)
- Truy cập `<APP_URL>` để vào Admin Dashboard.
- Đăng nhập bằng password (bản gốc của cái hash bạn đã cài).
- Thay vì dùng Cron Trigger phức tạp, hãy bấm nút **"Run Reminders"** trên thanh menu bên trái.
- Hệ thống sẽ lọc những ai sắp hết hạn (7 ngày, 3 ngày, 1 ngày) và gọi Webhook gửi email. Các email đã gửi sẽ không bị gửi trùng (Idempotency).
- Hạn mức Google cá nhân là ~100 emails/ngày. Phù hợp dùng cho nhóm gia đình.

## Hướng dẫn chạy thử ở Local (Máy cá nhân)

Để test hệ thống ngay trên máy của bạn trước khi deploy lên Cloudflare:

**Lựa chọn 1: Dành cho người dùng NPM**

1. **Cài đặt thư viện:**
   ```bash
   npm install
   ```

2. **Khởi tạo database D1 Local:**
   ```bash
   npx wrangler d1 execute billing-manager-db --local --file=./migrations/0001_initial.sql
   npx wrangler d1 execute billing-manager-db --local --file=./migrations/0002_seed.sql
   ```

3. **Khởi động server:**
   ```bash
   npm run dev
   ```

---

**Lựa chọn 2: Dành cho người dùng PNPM**

1. **Cài đặt thư viện:**
   ```bash
   pnpm install
   ```
   *(Lưu ý: Nếu gặp cảnh báo chặn script, hãy chạy `pnpm approve-builds`, ấn `a` để chọn tất cả -> `Enter`, rồi chạy lại `pnpm install`)*

2. **Khởi tạo database D1 Local:**
   ```bash
   pnpm exec wrangler d1 execute billing-manager-db --local --file=./migrations/0001_initial.sql
   pnpm exec wrangler d1 execute billing-manager-db --local --file=./migrations/0002_seed.sql
   ```

3. **Khởi động server:**
   ```bash
   pnpm run dev
   ```

---

**Cấu hình biến môi trường và Truy cập (Dành cho cả 2 cách)**

4. **Cấu hình biến môi trường Local:**
   Tạo file `.dev.vars` ở thư mục gốc (ngang hàng `wrangler.toml`) với nội dung sau:
   ```env
   APP_URL="http://localhost:8788"
   # Hash SHA-256 của chữ "admin"
   ADMIN_PASSWORD_HASH="8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918"
   ADMIN_COOKIE_SECRET="local-secret-123"
   GAS_WEBHOOK_URL=""
   GAS_WEBHOOK_SECRET=""
   ```
   
5. **Truy cập:**
   - Mở trình duyệt vào `http://localhost:8788`
   - Đăng nhập bằng mật khẩu: `admin`
