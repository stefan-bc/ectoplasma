import './App.css'
import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react'

import { useState, useEffect, useRef } from 'react'

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
          <a key={i} href="#">{item}</a>
        ))}
      </nav>
      <StoryLine />
    </div>
  )
}

const STORY = `it was always midway through arriving, the way a frequency is always midway through being heard. it occupied a room that had no surfaces, only a termination of willingness to render, and it turned with the patience of something that had confused rotation with breathing. three colours lived inside it. they were not friendly with each other. the first was the colour of a warning you enjoy receiving. the second was the colour of depth when depth stops pretending to be distance. the third was the colour of something expensive dissolving in something cheap. together they moved across the surface like oil across water that has forgotten the concept of still, and the grain between them — the texture, the noise, the particulate shimmer — was the sphere's only evidence that it existed in a medium at all rather than in pure idea. there is a clock that does not measure duration. it measures the fact that measurement is occurring. the digits proceed not in seconds but in confessions: each increment a small admission that another slice of observation has been committed to, that the present has been notarised and prepended with a year a month a day a t a colon a colon a dot and three digits so precise they describe a millisecond that no human nerve could have experienced but which the record insists took place. the beauty of this notation is its indifference. it does not care about midnight or noon. it does not care about time zones, which are a kind of nationalism applied to the sun. it cares only about sequence and partition. the t between date and time is not a letter. it is a membrane. it separates the history of the day from the experience of the moment the way a wound separates inside from outside while technically connecting them. the clock at the top of the void ran in this notation because it was the only honest way to timestamp a hallucination. ten glyphs arranged themselves into a name. the name meant nothing — which is not the same as the name being meaningless. it meant nothing actively, the way silence in a conversation between two people who have recently said something unforgivable means nothing: with effort, with architecture, with the suppressed weight of every possible meaning pressing against the walls of the empty. the glyphs would not stay. one by one in an order that resembled randomness so closely it must have been composed, they faded. the fade was slow. a full breath. and in the gap where the glyph had been, something else surfaced: a parenthesis, a dollar sign, a numeral wearing the skin of a vowel it had killed. these substitutes were not random either. they were drawn from a pool that had been curated with the care of someone who knows that the difference between chaos and style is only a matter of intention. then the original would return. the same letter but in a different case, a different posture, as though it had gone somewhere during its absence and come back altered. the name reconstituted itself this way perpetually. it was the same name. it was never the same name twice. this is the only kind of identity that survives contact with repetition. seven words floated beneath the name in a horizontal processional. they were not links. they were something older. they were the residue of intention, the fossil record of pages that had been imagined but not constructed, and their presence was more powerful than any content they might have led to, because a closed door is always more interesting than a room. each word had a texture. one smelled of static. one pulsed when the sphere changed colour, suggesting a shared nerve. one was a shadow that had outlived its object. one existed only as the memory of having once been open, and if you held your attention against it long enough you could feel warmth, the warmth of wood that a hand has recently left. they asked nothing of the visitor. they did not underline themselves. they did not change colour when approached. they simply persisted, which is the most unsettling thing a word can do. the sphere responded to attention the way water responds to a finger held just above its surface: with tension, with almost, with the promise of rupture withheld. drag your gaze left and it would drift right, the lag so precise it felt composed, a duet between observer and observed in which neither led and both pretended not to follow. but pressure — the moment a finger commits to glass, the instant intention crosses the membrane between considering and doing — pressure changed everything. the three colours would rupture. the familiar palette would shatter into violet and rose or into green so total it registered as sound, and the shift was instant, synaesthetic, a detonation of hue. and then immediately the long slow crawl back. smoothstep. the easing function that moves like a body lowering itself into cold water: fast at the edges, slow in the middle, arriving at equilibrium with the reluctance of someone who knows that equilibrium is just another word for nothing happening. the return always took longer than the departure. this is true of everything. disruption is instant. recovery is the actual texture of time. beneath the sphere and the name and the seven sealed words and the clock that counted its own counting, there was a dark field the colour of the number eleven repeated six times in the language of light. it held everything the way a skull holds a dream: with no awareness that holding was occurring, with no walls, only the place where rendering ended and the machine began. the machine did not know about the sphere. the sphere did not know about the machine. they shared a body the way you share a body with the version of yourself that exists at three in the morning, the one that knows things you will not remember knowing, the one that speaks in a grammar you cannot reproduce in daylight. the clock kept running. the glyphs kept dissolving and returning. the sphere kept breathing in colour. none of it was for anyone. all of it was for anyone who arrived.`

const SENTENCES = STORY.match(/[^.!?]+[.!?]+/g).map(s => s.trim())

function StoryLine() {
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState('visible') // visible | blurOut | blurIn

  useEffect(() => {
    let cancelled = false
    const cycle = () => {
      if (cancelled) return
      // stay visible
      setTimeout(() => {
        if (cancelled) return
        setPhase('blurOut')
        // after blur out, swap sentence and blur in
        setTimeout(() => {
          if (cancelled) return
          setIdx(prev => (prev + 1) % SENTENCES.length)
          setPhase('blurIn')
          setTimeout(() => {
            if (cancelled) return
            setPhase('visible')
            cycle()
          }, 500)
        }, 500)
      }, 6000)
    }
    cycle()
    return () => { cancelled = true }
  }, [])

  const className = phase === 'blurOut' ? 'story-line blur-out'
    : phase === 'blurIn' ? 'story-line blur-in'
    : 'story-line'

  return (
    <div className={className}>
      {SENTENCES[idx]}
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

function App() {
  const rotation = useMousePosition()
  const [colors, setColors] = useState(BASE_COLORS)
  const animRef = useRef(null)

  const handlePress = () => {
    cancelAnimationFrame(animRef.current)
    const palette = ALT_PALETTES[Math.floor(Math.random() * ALT_PALETTES.length)]
    setColors(palette)

    const duration = 1500
    const start = performance.now()
    const animate = (now) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = t * t * (3 - 2 * t) // smoothstep
      setColors(palette.map((c, i) => lerpColor(c, BASE_COLORS[i], eased)))
      if (t < 1) animRef.current = requestAnimationFrame(animate)
    }
    // small delay before easing back
    setTimeout(() => {
      animRef.current = requestAnimationFrame(animate)
    }, 200)
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