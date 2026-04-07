# RizerVitoo Web Application

A modern React-based web platform for accommodation bookings and reservations management.

## ✨ Features

- **User Authentication** - Email/password and Google OAuth login
- **Provider Management** - Register, manage listings, and handle bookings
- **Real-time Notifications** - Push notifications with auto-refresh
- **Image Management** - Avatar editing with cropping and compression
- **Multi-language Support** - English, French, and Arabic (with RTL support)
- **Responsive Design** - Optimized for mobile and desktop

## 🚀 Getting Started

### Requirements
- Node.js 16+
- npm/yarn

### Installation

```bash
git clone <YOUR_GIT_URL>
cd rezervitoo-web
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## 📚 Documentation

- **[PROJECT_SETUP.md](./PROJECT_SETUP.md)** - Complete setup guide, API patterns, and troubleshooting
- **[RizerVitoo Support API Documentation.md](./RizerVitoo%20Support%20API%20Documentation.md)** - Reviews, reports, wishlists
- **[RizerVitoo Listings API Documentation.md](./RizerVitoo%20Listings%20API%20Documentation.md)** - Listings management
- **[RizerVitoo Bookings API Documentation.md](./RizerVitoo%20Bookings%20API%20Documentation.md)** - Bookings workflow
- **[RezerVitoo Mobile API Documentation.md](./RezerVitoo%20Mobile%20API%20Documentation.md)** - Users and authentication

## 🏗️ Built With

- **Vite** - Next generation frontend tooling
- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - High-quality React components
- **Sonner** - Toast notifications
- **Lucide Icons** - Beautiful icons
- **date-fns** - Date manipulation

## 📦 Project Structure

```
src/
├── pages/          # Full page components
├── components/     # Reusable UI components
├── lib/
│   ├── api/       # API service layer
│   └── utils/     # Utility functions
├── i18n/          # Internationalization
└── types/         # TypeScript definitions
```

## 🔧 Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## 🌐 Environment Variables

```
VITE_API_BASE_URL=https://api.rezervitoo.com
```

## 🔑 Key Features Explained

### Provider Profile
- Edit personal information (name, phone, email)
- Upload and crop avatar image
- View verification status
- No document submission required (admins handle verification)

### Notifications
- Bell icon shows unread count
- Auto-refresh token on expiration
- Mark as read / Delete notifications
- 2-minute polling interval

### Image Uploading
- Crop images with preview
- Auto-compress (up to 800px width)
- Cache-busting for fresh display
- Progress tracking during upload

## 🤝 Contributing

1. Clone the repository
2. Create a feature branch
3. Make your changes
4. Commit and push
5. Open a pull request

## 📄 License

This project is proprietary and confidential.

---

For detailed setup and troubleshooting, see [PROJECT_SETUP.md](./PROJECT_SETUP.md)
