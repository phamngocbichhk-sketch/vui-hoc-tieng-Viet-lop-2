# Vui Đọc Tiếng Việt 2 - Lớp 2 (Bộ sách Kết nối tri thức với cuộc sống)

Ứng dụng web tương tác hỗ trợ học sinh lớp 2 luyện đọc Tiếng Việt theo chương trình chuẩn Sách giáo khoa (Kết nối tri thức với cuộc sống), bám sát giọng đọc chuẩn Hà Nội mẫu mực của **Cô Nguyễn Thị Sương - Trường Tiểu học Đỗ Thúc Tịnh** (VioEdu TV).

---

## 🌟 Tính Năng Nổi Bật

1. **Nghe cô đọc mẫu toàn bài & từng câu chuẩn xác 100%:**
   - 100% giọng nữ Hà Nội ngọt ngào, truyền cảm, ngắt nghỉ đúng nhịp.
   - Bấm vào bất kỳ câu nào để cô giáo đọc riêng câu đó với độ chuẩn xác tuyệt đối.
   - Chế độ đọc Karaoke tô màu từ ngữ đang phát âm, điều chỉnh tốc độ đọc (0.8x, 1.0x, 1.2x), chế độ lặp lại từng câu.
   - Hiển thị ngắt nhịp thơ và câu văn theo hướng dẫn sư phạm (`/` và `//`).

2. **Luyện đọc & Giải nghĩa từ khó:**
   - Đánh vần chi tiết âm đầu, vần, dấu thanh.
   - Nghe cô phát âm mẫu từng từ.
   - Bé luyện đọc qua Micro và nhận diện giọng nói tức thì.

3. **Bé luyện đọc & Chấm điểm (AI Voice Recognition):**
   - Học sinh bấm micro để đọc từng câu văn/câu thơ.
   - Chấm điểm số sao (1 ⭐, 2 ⭐, 3 ⭐), phân tích độ chính xác, từ đọc nhầm/thiếu.
   - Lời khen ngợi, động viên ấm áp từ cô giáo bằng giọng nói thật.

4. **Tìm hiểu bài (Trắc nghiệm đọc hiểu):**
   - Bộ câu hỏi trắc nghiệm bám sát nội dung SGK, có giải thích đáp án chi tiết và tích lũy ngôi sao khen thưởng.

5. **Luyện đọc phân vai (Role-play):**
   - Đọc phân vai theo các nhân vật trong bài đọc (*Người dẫn chuyện, Nàng Xuân, Nàng Hạ, Nàng Thu, Nàng Đông, Bà Đất*).

6. **Tra cứu Sách Giáo Khoa Gốc:**
   - Tích hợp trực tiếp bản PDF gốc SGK Tiếng Việt 2 Tập 1 & Tập 2.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local)

### Yêu cầu hệ thống:
- [Node.js](https://nodejs.org/) phiên bản 18 trở lên.
- Trình duyệt Chrome hoặc Edge (để hỗ trợ tính năng Web Speech API cho Micro).

### Các bước cài đặt:

1. **Cài đặt các gói phụ thuộc:**
   ```bash
   npm install
   ```

2. **Cấu hình môi trường (Tùy chọn):**
   Tạo file `.env` từ `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *(Nếu có `GEMINI_API_KEY`, bạn có thể điền vào file `.env` để kích hoạt thêm tính năng trợ lý chấm điểm thông minh).*

3. **Chạy máy chủ phát triển (Development):**
   ```bash
   npm run dev
   ```
   Mở trình duyệt tại: `http://localhost:3000`

4. **Đóng gói dự án (Production Build):**
   ```bash
   npm run build
   npm start
   ```

---

## 📤 Hướng Dẫn Đẩy Mã Nguồn Lên GitHub

1. Tạo một repository mới trên GitHub (ví dụ: `vui-doc-tieng-viet-2`).
2. Mở Terminal / PowerShell tại thư mục dự án và chạy các lệnh:
   ```bash
   git init
   git add .
   git commit -m "Khởi tạo dự án Vui Đọc Tiếng Việt 2"
   git branch -M main
   git remote add origin https://github.com/<tai-khoan-cua-ban>/<ten-repo>.git
   git push -u origin main
   ```

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion.
- **Backend / API:** Node.js, Express, TTS Server Cache, Google GenAI SDK.
- **Audio Engine:** HTML5 Audio, Web Audio API Synthesizer, Web Speech API Recognition.
- **Dữ liệu SGK:** Bộ sách Kết nối tri thức với cuộc sống (Tập 1 & Tập 2).
- **Giáo viên hướng dẫn:** Cô Nguyễn Thị Sương - Trường Tiểu học Đỗ Thúc Tịnh (VioEdu TV).
