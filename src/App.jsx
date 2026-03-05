import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react'

function App() {
  return (
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
  )
}

export default App