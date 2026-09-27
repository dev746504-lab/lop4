# Giải quyết mâu thuẫn với bạn bè — Kỹ năng sống Khối 4 (Tiết 2)

Ứng dụng web game tương tác cho Bảng tương tác / Tivi lớp học, gồm 4 mini-game
theo đúng tiến trình tiết học: Thử tài Gỡ rối, Bóng bay Ghép từ, Viết lên Cát –
Khắc lên Đá, Biệt đội Hòa Giải, và phần Tổng kết & Vận dụng.

Toàn bộ logic nằm trong `src/App.jsx`. Không dùng ảnh/âm thanh ngoài — hiệu ứng
âm thanh được tổng hợp bằng Web Audio API, hình ảnh dùng SVG + Emoji + Lucide.

## Chạy thử (development)

```bash
npm install
npm run dev
```

Mở trình duyệt tại địa chỉ hiển thị (mặc định `http://localhost:5173`).

## Build bản production

```bash
npm run build
npm run preview
```

## Deploy lên Vercel

```bash
npm install -g vercel
vercel
```

Trả lời các câu hỏi mặc định (Vite framework preset được tự nhận diện), sau đó
chạy `vercel --prod` để deploy bản chính thức.

## Deploy lên Netlify

```bash
npm install -g netlify-cli
npm run build
netlify deploy --dir=dist
```

Dùng `netlify deploy --dir=dist --prod` để deploy bản chính thức. Hoặc kéo thả
thư mục `dist/` sau khi build vào [app.netlify.com/drop](https://app.netlify.com/drop).
