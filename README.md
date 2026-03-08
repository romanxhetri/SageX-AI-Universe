# 🌌 SageX AI Universe

An immersive 3D e-commerce solar system built with Next.js 15, Three.js, and React. Experience shopping like never before - navigate through a beautiful cosmic universe where each planet is a shopping hub!

![SageX AI Universe](https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80)

## ✨ Features

### 🛒 E-Commerce Hubs
- **📱 Mobile Hub** - Latest smartphones & accessories
- **💻 Laptop Hub** - High-performance computing devices
- **♻️ 2nd Hand Market** - Buy, sell, exchange pre-loved items
- **🎧 Product Hub** - Tech gadgets & essentials
- **👗 Fashion Hub** - Virtual try-on & trends
- **🏢 Real Estate** - Property & business assets
- **🎓 Video Hub** - Tutorials & learning content
- **🛠️ Tools Hub** - 16+ AI utilities dashboard

### 🌟 Visual Enhancements
- **Realistic Sun** - Multi-layer corona with plasma shaders, sunspots, and solar flares
- **Planet Atmospheres** - Fresnel-based glow effects on all planets
- **Multi-Layer Starfield** - 7000+ stars with realistic colors (blue-white, yellow, red giants)
- **Nebula Background** - Procedural cosmic clouds with animated flow
- **Cosmic Dust** - Atmospheric particle effects
- **Enhanced Rings** - Gradient shader rings with particle dust

### 🎮 Navigation Modes
- **🎥 Cinematic Mode** - Auto-rotating camera view
- **🚀 Pilot Mode** - First-person flight controls (WASD + Mouse)
- **📂 Directory Mode** - Hub selection cards

### 🤖 AI Features
- **SageX AI Assistant** - Chat interface for shopping help
- **Autopilot Commands** - Voice-like navigation ("Go to Laptop Hub")
- **16+ AI Tools** - Various AI utilities

### 💳 E-Commerce Features
- **Product Catalog** - 80+ products across all hubs
- **Shopping Cart** - Add, remove, update quantities
- **Checkout System** - Address & payment flow
- **User Profiles** - Orders history & wishlist
- **Admin Dashboard** - Product & user management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Bun (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/sagex-ai-universe.git

# Navigate to project
cd sagex-ai-universe

# Install dependencies
bun install

# Run development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **3D Engine**: Three.js with custom GLSL shaders
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google GenAI
- **Database**: Supabase (configurable)

## 📁 Project Structure

```
sagex-ai-universe/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main page with dynamic import
│   │   ├── layout.tsx        # App layout
│   │   └── globals.css       # Global styles
│   └── components/
│       └── SageXUniverse.tsx # Main 3D application
├── public/                   # Static assets
├── ENHANCEMENT_PLAN.md       # Visual enhancement details
└── README.md                 # This file
```

## 🎨 Visual Features Breakdown

### Sun System
- Multi-octave turbulence (FBM noise) for plasma
- Procedural sunspots
- Color temperature gradient (white → yellow → orange → red)
- Animated solar flares
- Multi-layer corona with shader-based glow

### Planets
- MeshStandardMaterial with emissive glow
- Fresnel-based atmospheric shells
- Enhanced ring system with particles
- Unique effects per hub type

### Starfield
- Foreground: 2000 bright stars with varied colors
- Background: 5000 dim stars for depth
- Spherical distribution for realistic sky

### Performance
- Adaptive quality based on device tier
- Reduced effects on mobile
- Pixel ratio capping
- Frame-skipping optimizations

## 🔧 Configuration

### Environment Variables (Optional)

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
API_KEY=your_google_ai_key
```

## 📱 Responsive Design

- **Desktop**: Full 3D experience with all effects
- **Tablet**: Optimized particle counts and effects
- **Mobile**: Touch controls with virtual joysticks, reduced effects

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Credits

- Three.js for 3D rendering
- Next.js team for the amazing framework
- All product images from Unsplash

---

Made with ❤️ by SageX Team
