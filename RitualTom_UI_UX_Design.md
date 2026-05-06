# RitualTom - UI/UX Design Spec (Chi tiết)

**Dự án:** RitualTom - My Talking Pet trên Ritual Testnet  
**Ngày:** 05/05/2026  
**Mục tiêu:** Thiết kế giao diện dễ thương, dễ dùng, mang vibe Web3 + Meme + Cute

---

## 1. Tổng quan thiết kế

### Brand Identity
- **Tên app:** RitualTom
- **Tagline:** "Nuôi mèo chảnh, trang trí nhà, chat thật với AI"
- **Vibe:** Cute + Degen (kết hợp dễ thương + cool/chảnh)
- **Color Palette:**
  - Primary: `#FF6B9D` (Hồng phấn)
  - Secondary: `#00E5C4` (Xanh mint)
  - Accent: `#FFD700` (Vàng gold - cho Legend)
  - Background: `#0F0F1A` (Đen tím tối)
  - Text: `#FFFFFF` + `#E0E0E0`

- **Font:**
  - Tiêu đề: `Poppins` hoặc `Nunito` (có độ bo tròn)
  - Nội dung: `Inter` hoặc `system-ui`

### Layout tổng thể (Desktop + Mobile responsive)
- **Top Bar:** Logo + Wallet Connect + RITUAL Balance
- **Left Sidebar (Desktop):** Menu điều hướng
- **Main Area:** Nội dung thay đổi theo màn hình
- **Right Sidebar (Desktop):** Pet Status + Quick Actions
- **Bottom Navigation (Mobile):** 4 icon chính

---

## 2. Các màn hình chính (Flow)

### Màn hình 1: Landing / Connect Wallet

**Mô tả:** Màn hình đầu tiên khi vào web

**Layout:**
- Background: Gradient hồng tím + vài icon mèo bay nhẹ
- Trung tâm: Logo lớn "RitualTom" + hình mèo dễ thương
- Dưới: Nút **"Kết nối ví để bắt đầu"** (rất to, màu hồng)
- Dưới cùng: "Đã có pet? Import từ ví khác"

**Component chính:**
- Button `Connect Wallet` (dùng ConnectKit hoặc RainbowKit)
- Modal chọn ví: MetaMask, WalletConnect, Rabby

**Animation:** Mèo nháy mắt, đuôi vẫy nhẹ

---

### Màn hình 2: Home - Phòng của Pet (Màn hình chính)

**Đây là màn hình quan trọng nhất**

**Layout (Desktop):**
- **Phần trên:** 
  - Tên pet + Cấp độ (Baby / Chad / Legend) + Level bar
  - Mood icon (😺 😎 🦁) + Hunger bar + Happiness bar

- **Phần giữa (lớn nhất):**
  - **Phòng 2D** (Canvas hoặc Div + CSS)
    - Kích thước: 800x500px
    - Pet có thể di chuyển ngẫu nhiên hoặc ngồi
    - Có thể **kéo thả đồ đạc** vào phòng
    - Pet sẽ tương tác với đồ (ngồi ghế, nằm giường…)

- **Phần dưới:**
  - 4 nút hành động nhanh: **Cho ăn** | **Chơi** | **Tắm** | **Ngủ**

**Right Sidebar:**
- Pet Status (Hunger, Happiness, Cleanliness, Energy)
- Danh sách phụ kiện đang mặc
- Nút "Mở Shop" + "Mở Kho"

**Mobile:**
- Phòng chiếm toàn màn hình
- Nút hành động ở dưới dạng floating button
- Vuốt lên để xem status

**Animation gợi ý:**
- Pet thở, chớp mắt, di chuyển nhẹ
- Khi cho ăn: animation mèo ăn (có hiệu ứng hạt rơi)
- Khi mua đồ mới: animation "đồ rơi từ trên trời"

---

### Màn hình 3: Shop (Cửa hàng Ritual)

**Layout:**
- **Top:** Tab 3 loại: **Thức ăn** | **Phụ kiện Pet** | **Đồ đạc Nhà**
- **Lưới sản phẩm:** 3-4 cột (responsive)
  - Mỗi item: Ảnh + Tên + Giá (RITUAL) + Nút "Mua"
  - Có rarity badge (Common / Rare / Epic / Legend)

**Chi tiết item ví dụ:**

**Thức ăn:**
- Cá ngừ (0.5 RITUAL) - Common
- Bánh mèo đặc biệt (2.5 RITUAL) - Rare
- Sữa hoàng gia (8 RITUAL) - Epic

**Phụ kiện Pet:**
- Nón chóp (1.2 RITUAL)
- Kính râm Chad (4.5 RITUAL)
- Vòng cổ Legend (25 RITUAL)

**Đồ đạc Nhà:**
- Giường nhỏ (3 RITUAL)
- Ghế gaming (12 RITUAL)
- Bể cá mini (35 RITUAL)

**Tương tác:**
- Click item → Modal chi tiết (mô tả + preview)
- Mua → Xác nhận bằng ví (Metamask popup)

---

### Màn hình 4: Inventory (Kho đồ)

**Layout:**
- Tab: **Phụ kiện Pet** | **Đồ đạc Nhà** | **Item đặc biệt**
- Lưới item đã sở hữu
- Item chưa dùng có nút **"Trang bị"** / **"Đặt vào phòng"**
- Item đang dùng có nút **"Tháo ra"**

**Đặc biệt:**
- Kéo item từ kho thả thẳng vào **phòng** (kéo thả thật)

---

### Màn hình 5: Chat với Pet (Quan trọng nhất)

**Layout:**
- **Trên cùng:** Avatar pet + Tên + Cấp độ + Mood
- **Giữa:** Chat box (giống ChatGPT)
  - Tin nhắn user bên phải (màu hồng)
  - Tin nhắn pet bên trái (màu mint)
- **Dưới:** Ô nhập text + nút gửi + nút voice (tùy chọn)

**Tính năng chat:**
- Gõ bất cứ thứ gì → Pet trả lời theo:
  - Cấp độ (Baby nói dễ thương, Legend nói chảnh + meme)
  - Mood hiện tại
  - Những gì bạn đã làm cho nó (có memory ngắn)
- Ví dụ câu trả lời:
  - Baby: "Mèo đói quá... cho mèo ăn đi màaa 🥺"
  - Chad: "Bro, hôm nay mày mua cái gì ngon cho anh chưa? 😎"
  - Legend: "Ngươi dám làm phiền ta à? ... Được thôi, ta tha thứ."

**Kỹ thuật:**
- Gọi **LLM Precompile** (0x0802) hoặc Agent đã có sẵn
- Có thể dùng RAG để nhớ lịch sử chat + hành động gần đây

---

### Màn hình 6: Pet Profile & Evolution

**Layout:**
- **Avatar lớn** pet (có thể thay đổi theo level + phụ kiện)
- **Stats đầy đủ:** Level, EXP, Hunger, Happiness, Cleanliness, Energy
- **Evolution Progress Bar**
  - Hiển thị rõ: "Cần thêm 320 EXP để lên Chad"
- **Nút "Tiến hóa ngay"** (chỉ hiện khi đủ điều kiện)

**Khi tiến hóa:**
- Animation đặc biệt + hiệu ứng sáng lấp lánh
- Pet thay đổi ngoại hình + tính cách chat

---

### Màn hình 7: Settings & Wallet

- Thông tin ví (địa chỉ rút gọn)
- Số dư RITUAL
- Nút **"Xuất pet (Transfer)"**
- Nút **"Xóa pet (cẩn thận!)"**
- Dark mode toggle
- Link Discord / Twitter

---

## 3. Component dùng lại (Reusable)

| Component          | Dùng ở đâu                  | Mô tả |
|--------------------|-----------------------------|-------|
| `PetAvatar`        | Home, Chat, Profile         | Ảnh pet + animation |
| `StatusBar`        | Home, Profile               | Hunger / Happiness bar |
| `ShopItemCard`     | Shop                        | Card sản phẩm + mua |
| `InventoryItem`    | Inventory                   | Item trong kho |
| `ChatBubble`       | Chat                        | Tin nhắn pet/user |
| `ConnectWalletBtn` | Toàn bộ                     | Nút kết nối ví |
| `RoomCanvas`       | Home                        | Phòng 2D kéo thả |

---

## 4. Animation & Micro-interaction (Quan trọng để app "sống")

- Pet thở, chớp mắt, di chuyển ngẫu nhiên
- Khi mua đồ: animation "đồ rơi từ trên trời vào phòng"
- Khi cho ăn: hạt thức ăn rơi, pet nhai
- Khi chat: pet có animation "đang nghĩ" (3 chấm)
- Khi tiến hóa: hiệu ứng sáng + particle
- Hover lên đồ đạc: tooltip + preview

---

## 5. Responsive (Mobile-first)

- **Mobile (< 768px):** 
  - Bottom nav 4 icon (Home, Shop, Chat, Profile)
  - Phòng chiếm toàn màn hình
  - Chat full screen khi mở

- **Desktop:** 
  - Sidebar 2 bên
  - Phòng to hơn

---

## 6. Công nghệ UI gợi ý

- **Framework:** Next.js 14 + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Animation:** Framer Motion
- **Phòng 2D:** 
  - Option 1: React-Konva (kéo thả tốt)
  - Option 2: HTML5 Canvas + PixiJS
  - Option 3: Đơn giản dùng Div + absolute positioning (nhanh nhất cho MVP)
- **Web3:** Viem + wagmi + ConnectKit
- **Chat:** Tích hợp sẵn LLM Agent

---

**Kết luận thiết kế:**

Giao diện **dễ thương nhưng không sến súa**, có chút **meme/chảnh** phù hợp với vibe Ritual.  
Người dùng sẽ **kết nối ví ngay từ đầu**, mọi hành động đều on-chain (mua đồ, tiến hóa, chat).

---

**Bạn muốn tiếp theo là gì?**

Reply:
- **"Làm file MD này đẹp hơn"** (thêm hình mockup mô tả)
- **"Viết code skeleton cho UI này"**
- **"Sang bước 2: Viết Smart Contract"**
- Hoặc chỉnh sửa bất kỳ phần nào ở trên

Cứ nói mình làm tiếp ngay! 🐱✨