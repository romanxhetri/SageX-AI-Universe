'use client'

import dynamic from 'next/dynamic'

// Dynamic import with ssr: false is required for Three.js components
// because Three.js uses browser-specific APIs (window, document, WebGL)
// that are not available during server-side rendering
const SageXUniverse = dynamic(() => import('@/components/SageXUniverse'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#020205',
      color: 'white',
      gap: '1rem'
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        border: '3px solid rgba(0, 242, 255, 0.3)',
        borderTopColor: '#00f2ff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        background: 'linear-gradient(to right, #00f2ff, #0099ff)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Loading SageX Universe...
      </div>
      <div style={{
        fontSize: '0.9rem',
        color: 'rgba(255,255,255,0.5)'
      }}>
        Initializing 3D Environment
      </div>
    </div>
  )
})

export default function Home() {
  return (
    <main style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <SageXUniverse />
    </main>
  )
}
