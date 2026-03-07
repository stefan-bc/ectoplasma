import './App.css'
import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react'

import { useState, useEffect, useRef } from 'react'

function TypingOverlay({ onMenuEffect }) {
  const baseTarget = 'ectoplasma'
  const randomCaseString = (str) => {
    let result = str
      .split('')
      .map(c => (Math.random() < 0.5 ? c.toUpperCase() : c.toLowerCase()))
    // ensure not all uppercase
    if (result.every(c => c === c.toUpperCase())) {
      const idx = Math.floor(Math.random() * result.length)
      result[idx] = result[idx].toLowerCase()
    }
    return result.join('')
  }
  const [target, setTarget] = useState(randomCaseString(baseTarget))
  const length = baseTarget.length
  // symbol pool used for scrambling
  const symbolPool = '!@#$%^&*()_+-=[]{};:\"\'",.<>/?\\|~`0123456789'
  const [text, setText] = useState(target.split(''))
  const [fading, setFading] = useState(Array(length).fill(false))

  useEffect(() => {
    let cancelled = false

    const randomOrder = () => {
      const arr = Array.from({ length }, (_, i) => i)
      for (let k = arr.length - 1; k > 0; k--) {
        const j = Math.floor(Math.random() * (k + 1))
        ;[arr[k], arr[j]] = [arr[j], arr[k]]
      }
      return arr
    }

    // pools for each position in "ectoplasma"
    // index 0 corresponds to 'e', index 1 to 'c', etc.
    const allowedPools = [
      ['3', 'e', '#', '('],      // for first letter (e)
      ['c', '(', '<'],           // second letter (c)
      null,                      // third letter (t) - use global symbol pool
      null,                      // fourth letter (o)
      null,                      // fifth letter (p)
      null,                      // sixth letter (l)
      null,                      // seventh letter (a)
      null,                      // eighth letter (s)
      null,                      // ninth letter (m)
      ['a', '4', '#'],                        // tenth letter (a)
    ]
    const randomSymbol = (idx) => {
      const pool = allowedPools[idx] || symbolPool.split('')
      return pool[Math.floor(Math.random() * pool.length)]
    }


    const scrambleOnce = () => {
      // pick a fresh casing for this cycle
      const newCase = randomCaseString(baseTarget)
      setTarget(newCase)
      const order = randomOrder()
      let idx = 0
      const step = () => {
        if (cancelled) return
        if (idx >= order.length) {
          setTimeout(() => {
            if (!cancelled) revertOnce()
          }, 2000)
          return
        }
        const i = order[idx++] 
        // fade out current letter
        setFading(prev => { const a = [...prev]; a[i] = true; return a })
        // after fade-out (1s), swap symbol and fade-in
        setTimeout(() => {
          setText(prev => {
            const a = [...prev]
            a[i] = randomSymbol()
            return a
          })
          setFading(prev => { const a = [...prev]; a[i] = false; return a })
          // wait full interval before moving to next letter
          setTimeout(step, 4000)
        }, 1000) // fade duration
      }
      step()
    }

    const revertOnce = () => {
      // use the same casing as was set when scramble started
      const caseToUse = target
      const order = randomOrder()
      let idx = 0
      const step = () => {
        if (cancelled) return
        if (idx >= order.length) {
          setTimeout(() => {
            if (!cancelled) scrambleOnce()
          }, 2000)
          return
        }
        const i = order[idx++] 
        setFading(prev => { const a = [...prev]; a[i] = true; return a })
        setTimeout(() => {
          setText(prev => {
            const a = [...prev]
            a[i] = caseToUse[i]
            return a
          })
          setFading(prev => { const a = [...prev]; a[i] = false; return a })
          setTimeout(step, 4000)
        }, 1000)
      }
      step()
    }

    scrambleOnce()
    return () => { cancelled = true }
  }, [])

  const fmt = (d) => d.toISOString().slice(0, 23)
  const [time, setTime] = useState(() => fmt(new Date()))
  useEffect(() => {
    const id = setInterval(() => setTime(fmt(new Date())), 37)
    return () => clearInterval(id)
  }, [])

  const menuItems = ['phantasm', 'residue', 'viscera', 'umbral', 'miasma', 'sigil', 'revenant']

  return (
    <div className="typing-overlay">
      <div className="typing-text">
        <span>{time}</span>{' '}
        {text.map((ch, idx) => (
          <span
            key={idx}
            className={fading[idx] ? 'fading' : ''}
          >
            {ch}
          </span>
        ))}
      </div>
      <nav className="menu">
        {menuItems.map((item, i) => (
          <a key={i} href="#" onClick={(e) => { e.preventDefault(); onMenuEffect(i) }}>{item}</a>
        ))}
      </nav>
    </div>
  )
}

function useMousePosition() {
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })
  const raf = useRef(null)

  useEffect(() => {
    const handleMove = (e) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2
      const ny = (e.clientY / window.innerHeight - 0.5) * 2
      target.current = { x: ny * 30, y: nx * 30 }
    }
    const handleTouch = (e) => {
      const touch = e.touches[0]
      if (!touch) return
      const nx = (touch.clientX / window.innerWidth - 0.5) * 2
      const ny = (touch.clientY / window.innerHeight - 0.5) * 2
      target.current = { x: ny * 30, y: nx * 30 }
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('touchmove', handleTouch, { passive: true })

    const animate = () => {
      const lerp = 0.05
      current.current.x += (target.current.x - current.current.x) * lerp
      current.current.y += (target.current.y - current.current.y) * lerp
      setRotation({ x: current.current.x, y: current.current.y })
      raf.current = requestAnimationFrame(animate)
    }
    raf.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('touchmove', handleTouch)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return rotation
}

const BASE_COLORS = ['#ff7a33', '#33a0ff', '#ffc53d']
const BASE_SHADER = { uAmplitude: 1.4, uDensity: 1.1, uFrequency: 5.5, uSpeed: 0.1, uStrength: 0.4 }

const MENU_EFFECTS = [
  // phantasm — cool violet shift, slower, softer
  { colors: ['#c084fc', '#60a5fa', '#e9d5ff'], shader: { uAmplitude: 1.0, uSpeed: 0.05, uStrength: 0.3 } },
  // residue — warm amber, denser
  { colors: ['#fbbf24', '#f97316', '#fde68a'], shader: { uDensity: 1.6, uFrequency: 4.0, uStrength: 0.5 } },
  // viscera — deep red pulse, high amplitude
  { colors: ['#ef4444', '#7f1d1d', '#fca5a5'], shader: { uAmplitude: 2.2, uSpeed: 0.2, uFrequency: 3.5 } },
  // umbral — dark indigo, compressed
  { colors: ['#312e81', '#4338ca', '#6366f1'], shader: { uAmplitude: 0.8, uDensity: 0.7, uSpeed: 0.04 } },
  // miasma — sickly green, diffuse
  { colors: ['#4ade80', '#166534', '#bbf7d0'], shader: { uDensity: 1.8, uStrength: 0.6, uFrequency: 7.0 } },
  // sigil — electric blue, sharp
  { colors: ['#38bdf8', '#1e3a5f', '#bae6fd'], shader: { uFrequency: 8.0, uStrength: 0.2, uAmplitude: 1.8 } },
  // revenant — ghostly pale, barely there
  { colors: ['#e2e8f0', '#94a3b8', '#cbd5e1'], shader: { uAmplitude: 0.6, uSpeed: 0.03, uDensity: 0.5 } },
]

const ALT_PALETTES = [
  ['#a855f7', '#6366f1', '#ec4899'],
  ['#10b981', '#06b6d4', '#84cc16'],
  ['#f43f5e', '#e879f9', '#fb923c'],
  ['#38bdf8', '#818cf8', '#34d399'],
]

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex([r, g, b]) {
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)
}

function lerpColor(a, b, t) {
  const ca = hexToRgb(a), cb = hexToRgb(b)
  return rgbToHex(ca.map((v, i) => Math.round(v + (cb[i] - v) * t)))
}

function lerpVal(a, b, t) {
  return a + (b - a) * t
}

function App() {
  const rotation = useMousePosition()
  const [colors, setColors] = useState(BASE_COLORS)
  const [shader, setShader] = useState(BASE_SHADER)
  const colorsRef = useRef(BASE_COLORS)
  const shaderRef = useRef(BASE_SHADER)
  const animRef = useRef(null)

  const animateTo = (targetColors, targetShader, duration, onDone) => {
    cancelAnimationFrame(animRef.current)
    const startColors = [...colorsRef.current]
    const startShader = { ...shaderRef.current }
    const startTime = performance.now()
    const animate = (now) => {
      const t = Math.min((now - startTime) / duration, 1)
      const eased = t * t * (3 - 2 * t)
      const newColors = targetColors.map((c, i) => lerpColor(startColors[i], c, eased))
      colorsRef.current = newColors
      setColors(newColors)
      const s = {}
      for (const k in BASE_SHADER) {
        s[k] = lerpVal(startShader[k], targetShader[k] ?? BASE_SHADER[k], eased)
      }
      shaderRef.current = s
      setShader(s)
      if (t < 1) {
        animRef.current = requestAnimationFrame(animate)
      } else if (onDone) {
        onDone()
      }
    }
    animRef.current = requestAnimationFrame(animate)
  }

  const handlePress = () => {
    const palette = ALT_PALETTES[Math.floor(Math.random() * ALT_PALETTES.length)]
    animateTo(palette, BASE_SHADER, 100, () => {
      setTimeout(() => animateTo(BASE_COLORS, BASE_SHADER, 1500), 200)
    })
  }

  const handleMenuEffect = (idx) => {
    const effect = MENU_EFFECTS[idx]
    const targetShader = { ...BASE_SHADER, ...effect.shader }
    animateTo(effect.colors, targetShader, 800, () => {
      setTimeout(() => animateTo(BASE_COLORS, BASE_SHADER, 2500), 1500)
    })
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: '#111111',
        }}
        onMouseDown={handlePress}
        onTouchStart={handlePress}
      >
        <ShaderGradientCanvas
          style={{ width: '100%', height: '100%' }}
          pointerEvents="none"
        >
          <ShaderGradient
            animate="on"
            brightness={1.5}
            cAzimuthAngle={0}
            cDistance={0.8}
            cPolarAngle={90}
            cameraZoom={3.5}
            positionX={0}
            positionY={0}
            positionZ={0}
            rotationX={rotation.x}
            rotationY={rotation.y}
            rotationZ={0}
            color1={colors[0]}
            color2={colors[1]}
            color3={colors[2]}
            grain="on"
            lightType="3d"
            type="sphere"
            uAmplitude={shader.uAmplitude}
            uDensity={shader.uDensity}
            uFrequency={shader.uFrequency}
            uSpeed={shader.uSpeed}
            uStrength={shader.uStrength}
          />
        </ShaderGradientCanvas>
      </div>
      <TypingOverlay onMenuEffect={handleMenuEffect} />
    </>
  )
}

export default App