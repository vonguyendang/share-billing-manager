# Share Billing Manager

Dự án MVP quản lý chia sẻ chi phí gia đình trên Cloudflare Pages (Chi phí 0 đồng).

## Kiến trúc

- **Frontend:** Vanilla JS, HTML, CSS.
- **Backend:** Cloudflare Pages Functions (TypeScript).
- **Database:** Cloudflare D1 (SQLite).
- **Email:** Google Apps Script Webhook (gửi qua Gmail cá nhân).

## Hướng dẫn triển khai miễn phí (Production Deployment)

Dự án này được thiết kế tối ưu để chạy trên nền tảng **Cloudflare Pages** (chứa giao diện tĩnh và API backend) kết hợp với **Cloudflare D1** (Database). Dưới đây là các bước chi tiết để đưa dự án lên mạng thực tế.

### 1. Tạo Database D1 (Trên Production)

Bạn cần tạo một cơ sở dữ liệu thật trên máy chủ Cloudflare bằng dòng lệnh sau:

```bash
npx wrangler d1 create billing-manager-db
```

Sau khi chạy xong, màn hình sẽ in ra một đoạn cấu hình gồm `database_name` và `database_id`. Hãy copy cái `database_id` đó.

### 2. Cập nhật `wrangler.toml`

Mở file `wrangler.toml` và dán `database_id` vừa copy vào thay cho dòng `your-database-id-here`. Sau đó nhớ **commit và push** sự thay đổi này lên GitHub.

```bash
git add wrangler.toml
git commit -m "chore: update production d1 id"
git push
```

### 3. Khởi tạo cấu trúc bảng Database

Bạn cần đẩy cấu trúc bảng từ máy lên Cloudflare D1 bằng lệnh:

```bash
npx wrangler d1 execute billing-manager-db --remote --file=./migrations/0001_initial.sql
npx wrangler d1 execute billing-manager-db --remote --file=./migrations/0003_add_reminder_days.sql
npx wrangler d1 execute billing-manager-db --remote --file=./migrations/0004_add_plan_slots.sql
npx wrangler d1 execute billing-manager-db --remote --file=./migrations/0005_add_telegram_settings.sql
npx wrangler d1 execute billing-manager-db --remote --file=./migrations/0006_add_previous_due_date.sql
npx wrangler d1 execute billing-manager-db --remote --file=./migrations/0007_add_new_features.sql
```

*(Lưu ý cờ `--remote` ở đây báo cho Cloudflare biết là bạn đang muốn can thiệp vào Database thật trên mạng).*

### 4. Thiết lập Google Apps Script (Email Webhook) - Tuỳ chọn

Nếu bạn muốn dùng tính năng gửi Email tự động:

1. Truy cập [script.google.com](https://script.google.com/) tạo project mới.
2. Copy code từ `scripts/webhook.gs` dán vào.
3. Đổi biến `SECRET_KEY` thành một chuỗi ngẫu nhiên khó đoán (VD: `my-super-secret-123`).
4. Bấm nút **Deploy > New deployment**.
5. Chọn loại **Web app**. Execute as: **Me**. Who has access: **Anyone**.
6. Deploy, cấp quyền và Copy **Web app URL**.

### 5. Deploy Mã Nguồn qua GitHub

Vì bạn đã đưa mã nguồn lên GitHub, cách dễ và tự động nhất là liên kết trực tiếp Cloudflare với GitHub:

1. Đăng nhập vào trang quản trị [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Vào mục **Workers & Pages** -> Chọn **Create application** -> Chuyển sang tab **Pages** -> Bấm **Connect to Git**.
3. Chọn Repository `share-billing-manager` của bạn.
4. Ở bước **Set up builds and deployments**, cấu hình:
   - **Framework preset**: `None`
   - **Build command**: *(để trống)*
   - **Build output directory**: `public`
5. Bấm **Save and Deploy**. Sau khoảng 1-2 phút, Cloudflare sẽ cấp cho bạn một đường link (ví dụ: `https://share-billing-manager.pages.dev`).

### 6. Cài Đặt Biến Môi Trường (Quan trọng)

1. Tại Cloudflare Dashboard, vào trang quản lý của dự án Pages vừa tạo.
2. Chọn tab **Settings** -> **Environment variables** -> Cột **Production**.
3. Bấm **Add variables** và thêm các biến sau:
   - `ADMIN_PASSWORD_HASH`: Mã băm SHA-256 mật khẩu admin của bạn.
   - `ADMIN_COOKIE_SECRET`: Một chuỗi ký tự ngẫu nhiên dùng để mã hóa Cookie.
   - `APP_URL`: Đường link Cloudflare Pages vừa cấp (VD: `https://share-billing-manager.pages.dev`).
   - `GAS_WEBHOOK_URL` *(Nếu dùng)*: Link Web app URL ở bước 4.
   - `GAS_WEBHOOK_SECRET` *(Nếu dùng)*: Chuỗi secret đã tạo ở bước 4.
4. Chuyển sang tab **Deployments** -> Bấm vào dấu `...` ở bản deploy mới nhất -> Chọn **Retry deployment** để hệ thống nhận diện biến mới.

🎉 **Hoàn Tất!** Giờ đây bạn đã có thể truy cập đường link thực tế và bắt đầu quản lý.

### 7. Cấu hình Tự động chạy mỗi ngày (Cron Job) - Khuyên dùng

Để hệ thống tự động nhắc nhở và khóa dịch vụ khi quá hạn, bạn cần cấu hình một dịch vụ gọi vào API `/api/reminders` mỗi sáng. Cách đơn giản và miễn phí nhất là sử dụng **cron-job.org**.

1. Đăng nhập hoặc tạo tài khoản miễn phí tại [cron-job.org](https://cron-job.org).
2. Bấm **Create Cronjob**.
3. Ở ô **URL**, nhập địa chỉ API của bạn theo định dạng sau: `https://[TÊN_MIỀN_CỦA_BẠN]/api/reminders?cron_key=THAY_BẰNG_SECRET_CỦA_BẠN` (Chuỗi bí mật này chính là biến `ADMIN_COOKIE_SECRET` bạn đã set trên Cloudflare).
4. Lên lịch chạy (Schedule): Chọn **User-defined**, chạy mỗi ngày 1 lần vào lúc **08:00 AM** (chọn múi giờ Asia/Ho_Chi_Minh).
5. Cuộn xuống phần **Advanced**:
   - HTTP Method: Chọn `POST`.
6. Bấm **Create** để lưu lại.

> **🕵️ Mẹo lấy mã bí mật cực nhanh:**
> Nếu bạn quên mã bí mật, không cần phải vào Cloudflare! Chỉ cần đăng nhập vào trang Admin trên trình duyệt, nhấn **F12** -> chọn tab **Application** (hoặc **Storage**) -> mục **Cookies**. Giá trị của cookie tên là `admin_session` chính là mã bí mật của bạn. Bạn copy nó và thay vào chỗ URL trên cron-job là xong.

Từ nay, cứ 8h sáng, hệ thống này sẽ tự động quét toàn bộ danh sách, gửi email báo sắp đến hạn, quá hạn và tự động khóa những người dùng trễ nợ!

### 8. Cấu hình Telegram Bot (Tuỳ chọn)

Hệ thống hỗ trợ gửi thông báo tự động qua Telegram cho Admin khi:
- Có người gửi yêu cầu thanh toán mới.
- Admin duyệt/từ chối/hoàn tác (undo) thanh toán.
- Khách hàng bấm yêu cầu hủy gia hạn từ Portal.
- Hệ thống gửi email nhắc nhở/cảnh báo thành công.

### 9. Các tính năng nổi bật khác
- **Thanh toán VietQR:** Hệ thống tự động tạo mã QR chính xác số tiền và nội dung chuyển khoản cho từng khách hàng trên Portal.
- **Khách hàng tự thao tác:** Khách hàng có thể xem lịch sử, thông tin gói và có quyền (nếu Admin bật) bấm nút yêu cầu không gia hạn cho chu kỳ sau.
- **Quản lý Thu - Chi (Expenses):** Ghi chép chi phí sinh hoạt/vận hành, tính toán lợi nhuận Thực tế so với Dự toán trên Dashboard.
- **Xuất dữ liệu (Export CSV):** Tải toàn bộ dữ liệu ra file Excel/CSV để lưu trữ và báo cáo.

Để nhận được thông báo, bạn cần phải có **Bot Token** và **Chat ID**. Dưới đây là các bước chi tiết:

#### Bước 1: Tạo Bot và lấy Bot Token
1. Mở ứng dụng Telegram, tìm kiếm tài khoản `@BotFather` (có dấu tích xanh) và bấm Start.
2. Gõ lệnh `/newbot` để bắt đầu tạo Bot.
3. Nhập **Tên hiển thị** cho Bot (ví dụ: `Share Billing Manager`).
4. Nhập **Username** cho Bot (phải kết thúc bằng chữ `bot`, ví dụ: `my_billing_admin_bot`).
5. Nếu thành công, BotFather sẽ gửi cho bạn một tin nhắn dài, trong đó có chứa **Bot Token** (một chuỗi có dạng `123456789:ABCdefGHIjklMNOpqrSTUvwxYZ`). Hãy copy đoạn mã này lại.

*(Lưu ý: Để Bot trông chuyên nghiệp hơn, bạn có thể thiết lập thêm About, Description, và Avatar thông qua các lệnh của BotFather).*

#### Bước 2: Bắt đầu trò chuyện với Bot
Bạn phải là người nhắn tin cho Bot trước thì Bot mới có thể gửi thông báo lại cho bạn (Telegram chống spam).
- Quay lại ô tìm kiếm của Telegram, gõ **Username** của Bot bạn vừa tạo.
- Bấm **Start** hoặc gửi cho nó một tin nhắn bất kỳ (VD: `Hello`).

#### Bước 3: Lấy Chat ID của bạn (hoặc Group)
Bot cần biết chính xác ID của bạn (hoặc ID của Group) để gửi thông báo đến đúng nơi.
1. Tìm kiếm tài khoản `@userinfobot` trên Telegram và bấm Start. Nó sẽ trả về cho bạn một dãy số (ví dụ: `123456789`). Đây chính là **Chat ID** cá nhân của bạn.
2. *(Nâng cao)* Nếu bạn muốn Bot gửi thông báo vào một **Group/Supergroup**:
   - Hãy thêm Bot của bạn vào Group đó.
   - Để đảm bảo Bot không bị chặn bởi các cài đặt chống spam của Group, **hãy set Bot làm Admin** của Group (chỉ cần cấp quyền Send Messages là đủ).
   - Truy cập trang web `https://api.telegram.org/bot<THAY_BẰNG_TOKEN_CỦA_BẠN>/getUpdates`
   - Tìm đoạn `"chat":{"id": -100xxxxxxxxxx` để lấy ID của Group (thường bắt đầu bằng dấu trừ `-`).

*(Mẹo nhanh: Nếu bạn có link của một bài viết trong Topic, ví dụ `https://t.me/c/1922137058/1015`, thì:)*
- *`1922137058` là ID của Group. Bạn phải thêm `-100` vào trước để thành **Chat ID** là `-1001922137058`.*
- *`1015` (số cuối cùng) chính là **Topic ID**.*

#### Bước 4: Cấu hình trên hệ thống
1. Vào trang quản trị Admin, chuyển sang tab **Settings** (Cài đặt).
2. Tích chọn **Bật thông báo qua Telegram**.
3. Dán **Bot Token**, **Chat ID** (và **Topic ID** nếu có) vào các ô tương ứng.
4. Bấm nút **"🚀 Gửi tin nhắn Test (Test Bot)"** để kiểm tra thử. Nếu Telegram của bạn nhận được tin nhắn mẫu thì có nghĩa là cấu hình đã chính xác!
5. Bấm **Lưu cài đặt** để hoàn tất.
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
   npx wrangler d1 execute billing-manager-db --local --file=./migrations/0003_add_reminder_days.sql
   npx wrangler d1 execute billing-manager-db --local --file=./migrations/0004_add_plan_slots.sql
   npx wrangler d1 execute billing-manager-db --local --file=./migrations/0005_add_telegram_settings.sql
   npx wrangler d1 execute billing-manager-db --local --file=./migrations/0006_add_previous_due_date.sql
   npx wrangler d1 execute billing-manager-db --local --file=./migrations/0007_add_new_features.sql
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
   pnpm exec wrangler d1 execute billing-manager-db --local --file=./migrations/0003_add_reminder_days.sql
   pnpm exec wrangler d1 execute billing-manager-db --local --file=./migrations/0004_add_plan_slots.sql
   pnpm exec wrangler d1 execute billing-manager-db --local --file=./migrations/0005_add_telegram_settings.sql
   pnpm exec wrangler d1 execute billing-manager-db --local --file=./migrations/0006_add_previous_due_date.sql
   pnpm exec wrangler d1 execute billing-manager-db --local --file=./migrations/0007_add_new_features.sql
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
