# SageX AI Universe - Quick Reference

## 📁 Project Structure
```
src/
├── app/
│   ├── page.tsx          # Entry point (dynamic import)
│   ├── layout.tsx        # Metadata
│   └── globals.css       # All styles
└── components/
    └── SageXUniverse.tsx # MAIN FILE (1600+ lines)
```

## 🔑 Key Sections in SageXUniverse.tsx

| Lines | Section | Description |
|-------|---------|-------------|
| 1-10 | Imports | Three.js, React, etc. |
| 11-100 | Types | HubData, Product, User, etc. |
| 101-200 | Constants | HUBS array, products data |
| 201-460 | Shaders | Sun, corona, atmosphere shaders |
| 461-560 | App() | Main component, state management |
| 561-700 | Components | Header, NavBar, HubOverlay |
| 701-900 | Modals | ProductDetails, Checkout, Auth |
| 901-1100 | Admin | AdminDashboard component |
| 1101-1300 | Scene Setup | Three.js scene initialization |
| 1301-1500 | Objects | Sun, corona, stars, planets |
| 1501-1700 | Animation | animate() function |
| 1701-1900 | Controls | Joysticks, event handlers |

## 🌟 Main Features

### HUBS (8 planets)
- Mobile Hub (distance: 20, blue)
- Laptop Hub (distance: 35, silver)
- 2nd Hand Market (distance: 50, orange)
- Product Hub (distance: 65, cyan)
- Fashion Hub (distance: 80, pink)
- Real Estate (distance: 95, green, has ring)
- Video Hub (distance: 110, purple, icosahedron)
- Tools Hub (distance: 125, blue, torus)

### Navigation Modes
- `cinematic` - Auto-rotate camera
- `pilot` - First-person WASD controls
- `directory` - Card selection view

### Key Functions
- `SolarSystemScene()` - Three.js scene (line ~1114)
- `animate()` - Animation loop (line ~1695)
- `App()` - Main React component (line ~461)

## 🎨 Shaders
- `sunVertexShader` - Sun geometry
- `sunFragmentShader` - Sun plasma effect
- `coronaFragmentShader` - Corona glow
- `atmosphereFragmentShader` - Planet atmospheres
- `nebulaFragmentShader` - Background nebula

## 🔧 To Add New Planet
1. Add to HUBS array (line ~91)
2. Add products with matching hubId
3. Planet auto-creates with atmosphere

## 📦 Dependencies
- three (Three.js)
- @types/three
- @google/genai
- @supabase/supabase-js
- next (Next.js 15)
- react (React 19)

## 🚀 Quick Commands
```bash
bun install     # Install deps
bun run dev     # Start dev server
bun run lint    # Check code
```

---
*Use this file to quickly reference line numbers and structure!*
