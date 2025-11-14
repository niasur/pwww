# Cat Grooming Service - Complete Setup

## 🚀 Quick Start (Windows/VS Code)

### 1. Extract & Install
```bash
# Extract ZIP file
cd extracted-folder

# Install dependencies
npm install
```

### 2. Environment Setup
```bash
# Create .env file (otomatis)
echo DATABASE_URL="file:./db/custom.db" > .env

# Create db folder
mkdir db

# Generate Prisma client
npx prisma generate

# Initialize database
npm run db:push
```

### 3. Start Development
```bash
npm run dev
```

Buka `http://localhost:3000`

---

## 📁 Project Structure
```
cat-grooming-service/
├── .env                    ← Environment variables
├── db/
│   └── custom.db           ← SQLite database
├── prisma/
│   └── schema.prisma       ← Database schema
├── public/
│   └── logo.svg           ← Logo
├── src/
│   ├── app/
│   │   ├── page.tsx       ← Main page
│   │   ├── layout.tsx     ← Root layout
│   │   └── api/          ← API routes
│   ├── components/
│   │   ├── ui/           ← Shadcn UI components
│   │   └── ...           ← Custom components
│   └── lib/
│       ├── db.ts          ← Database connection
│       ├── database.ts    ← Database operations
│       └── notifications.ts ← Notification service
├── package.json
└── README.md
```

---

## 🎯 Features

### ✅ Completed Features
- [x] **Responsive Design** - Mobile & Desktop friendly
- [x] **Service Pricing** - IDR format with discounts
- [x] **Booking Form** - Complete validation
- [x] **WhatsApp Integration** - Direct chat with 628989878274
- [x] **Admin Dashboard** - Manage bookings & ratings
- [x] **Rating System** - Customer testimonials
- [x] **Order Tracking** - Track booking status
- [x] **Sample Data** - Pre-populated for testing

### 💰 Pricing Structure
- **Mandi Biasa**: IDR 75K → IDR 50K (diskon 50%)
- **Mandi Anti Kutu**: IDR 90K → IDR 75K (diskon 51%) ⭐
- **Mandi + Grooming**: IDR 100K → IDR 99K (diskon 1%)

---

## 🔧 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (New York style)
- **Database**: Prisma ORM with SQLite
- **Icons**: Lucide React
- **State Management**: Zustand + TanStack Query

---

## 📱 Usage Instructions

### For Customers:
1. **Browse Services** - View pricing and features
2. **Book Online** - Fill booking form
3. **WhatsApp Chat** - Direct communication
4. **Track Order** - Monitor booking status
5. **Leave Rating** - Share experience

### For Admin:
1. **Access Dashboard** - Password: `admin123`
2. **Manage Bookings** - Update status
3. **Moderate Ratings** - Approve/reject testimonials
4. **View Analytics** - Track performance

---

## 🛠️ Development Commands

```bash
# Development
npm run dev          # Start dev server

# Database
npm run db:push      # Push schema changes
npx prisma studio    # Open database viewer
npx prisma generate  # Regenerate client

# Production
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Check code quality
```

---

## 📞 Support

### WhatsApp: 628989878274
### Email: support@catgrooming.com

---

## 📄 License

MIT License - Free for commercial use

---

**Made with ❤️ for Cat Lovers**