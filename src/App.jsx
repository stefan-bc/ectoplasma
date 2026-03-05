import './App.css'
import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react'

import { useState, useEffect } from 'react'

function TypingOverlay() {
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

  return (
    <div className="typing-overlay">
      <div className="typing-text">
        {text.map((ch, idx) => (
          <span
            key={idx}
            className={fading[idx] ? 'fading' : ''}
          >
            {ch}
          </span>
        ))}
      </div>
    </div>
  )
}

function App() {
  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#111111',
      }}>
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
            rotationX={0}
            rotationY={0}
            rotationZ={0}
            color1="#ff7a33"
            color2="#33a0ff"
            color3="#ffc53d"
            grain="on"
            lightType="3d"
            type="sphere"
            uAmplitude={1.4}
            uDensity={1.1}
            uFrequency={5.5}
            uSpeed={0.1}
            uStrength={0.4}
          />
        </ShaderGradientCanvas>
      </div>
      <TypingOverlay />
    </>
  )
}

export default App