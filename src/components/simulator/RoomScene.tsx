import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Color, MathUtils } from 'three'
import { useMemo } from 'react'
import type { RoomObstacleDefinition } from '@/types/api'

export interface LightSettings {
  lumen: number
  cct: number
  angle: number
  power: number
  cri: number
}

interface RoomSceneProps {
  width: number
  length: number
  height: number
  obstacles: RoomObstacleDefinition[]
  activeObstacleIds: string[]
  light?: LightSettings
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const kelvinToColor = (kelvin: number) => {
  const temp = clamp(kelvin, 1000, 40000) / 100
  let red = 255
  let green = 255
  let blue = 255

  if (temp <= 66) {
    green = 99.4708 * Math.log(temp) - 161.1196
    blue = temp <= 19 ? 0 : 138.5177 * Math.log(temp - 10) - 305.0448
  } else {
    red = 329.6987 * Math.pow(temp - 60, -0.1332047)
    green = 288.1222 * Math.pow(temp - 60, -0.0755148)
  }

  return new Color(
    clamp(red, 0, 255) / 255,
    clamp(green, 0, 255) / 255,
    clamp(blue, 0, 255) / 255,
  )
}

const categoryColors: Record<string, string> = {
  furniture: '#8B6F52',
  opening: '#7BAFD4',
  fixture: '#F5D17A',
}

function RoomShell({
  width,
  length,
  height,
}: {
  width: number
  length: number
  height: number
}) {
  const wallThickness = 0.08
  const halfWidth = width / 2
  const halfLength = length / 2

  return (
    <group>
      <mesh position={[0, -wallThickness / 2, 0]} receiveShadow>
        <boxGeometry args={[width, wallThickness, length]} />
        <meshStandardMaterial color="#F3F4F6" />
      </mesh>
      <mesh position={[0, height / 2, -halfLength]} receiveShadow>
        <boxGeometry args={[width, height, wallThickness]} />
        <meshStandardMaterial color="#EDEFF2" />
      </mesh>
      <mesh position={[0, height / 2, halfLength]} receiveShadow>
        <boxGeometry args={[width, height, wallThickness]} />
        <meshStandardMaterial color="#F7F7FA" />
      </mesh>
      <mesh position={[halfWidth, height / 2, 0]} receiveShadow>
        <boxGeometry args={[wallThickness, height, length]} />
        <meshStandardMaterial color="#EEF1F5" />
      </mesh>
      <mesh position={[-halfWidth, height / 2, 0]} receiveShadow>
        <boxGeometry args={[wallThickness, height, length]} />
        <meshStandardMaterial color="#EEF1F5" />
      </mesh>
    </group>
  )
}

function Obstacle({
  obstacle,
  roomWidth,
  roomLength,
  roomHeight,
}: {
  obstacle: RoomObstacleDefinition
  roomWidth: number
  roomLength: number
  roomHeight: number
}) {
  const positionX = obstacle.placement.x * roomWidth
  const positionZ = obstacle.placement.z * roomLength
  const color = categoryColors[obstacle.category] ?? '#B0B6C1'
  const accentColor =
    obstacle.category === 'opening' ? '#D9ECF8' : '#F7E3A1'

  const centerY = () => {
    if (obstacle.id === 'hidden-lights' || obstacle.id === 'ceiling-light') {
      return roomHeight - obstacle.height / 2
    }
    if (obstacle.id === 'wall-lamps' || obstacle.id === 'mirror') {
      return roomHeight * 0.6
    }
    if (obstacle.id === 'window') {
      return roomHeight * 0.55
    }
    return obstacle.height / 2
  }

  const baseY = centerY() - obstacle.height / 2

  const BoxPiece = ({
    size,
    position,
    pieceColor,
  }: {
    size: [number, number, number]
    position: [number, number, number]
    pieceColor?: string
  }) => (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={pieceColor ?? color} />
    </mesh>
  )

  const renderObstacle = () => {
    switch (obstacle.id) {
      case 'bed': {
        const baseHeight = obstacle.height * 0.35
        const headboardHeight = obstacle.height * 0.85
        const headboardDepth = Math.max(0.1, obstacle.depth * 0.08)
        return (
          <group>
            <BoxPiece
              size={[obstacle.width, baseHeight, obstacle.depth]}
              position={[0, baseHeight / 2, 0]}
            />
            <BoxPiece
              size={[obstacle.width, headboardHeight, headboardDepth]}
              position={[
                0,
                headboardHeight / 2,
                -obstacle.depth / 2 + headboardDepth / 2,
              ]}
            />
          </group>
        )
      }
      case 'sofa': {
        const seatHeight = obstacle.height * 0.35
        const backHeight = obstacle.height * 0.45
        const seatDepth = obstacle.depth * 0.6
        const backDepth = obstacle.depth * 0.25
        const armWidth = obstacle.width * 0.15
        return (
          <group>
            <BoxPiece
              size={[obstacle.width, seatHeight, seatDepth]}
              position={[0, seatHeight / 2, 0]}
            />
            <BoxPiece
              size={[obstacle.width, backHeight, backDepth]}
              position={[
                0,
                seatHeight + backHeight / 2,
                -obstacle.depth / 2 + backDepth / 2,
              ]}
            />
            <BoxPiece
              size={[armWidth, seatHeight, seatDepth]}
              position={[-obstacle.width / 2 + armWidth / 2, seatHeight / 2, 0]}
            />
            <BoxPiece
              size={[armWidth, seatHeight, seatDepth]}
              position={[obstacle.width / 2 - armWidth / 2, seatHeight / 2, 0]}
            />
          </group>
        )
      }
      case 'coffee-table':
      case 'table': {
        const topThickness = obstacle.height * 0.15
        const legHeight = obstacle.height - topThickness
        const legWidth = obstacle.width * 0.08
        const legDepth = obstacle.depth * 0.08
        const xOffset = obstacle.width / 2 - legWidth / 2
        const zOffset = obstacle.depth / 2 - legDepth / 2
        return (
          <group>
            <BoxPiece
              size={[obstacle.width, topThickness, obstacle.depth]}
              position={[0, legHeight + topThickness / 2, 0]}
            />
            {[
              [-xOffset, legHeight / 2, -zOffset],
              [xOffset, legHeight / 2, -zOffset],
              [-xOffset, legHeight / 2, zOffset],
              [xOffset, legHeight / 2, zOffset],
            ].map((pos, index) => (
              <BoxPiece
                key={`leg-${index}`}
                size={[legWidth, legHeight, legDepth]}
                position={pos as [number, number, number]}
                pieceColor={accentColor}
              />
            ))}
          </group>
        )
      }
      case 'tv-stand': {
        const shelfHeight = obstacle.height * 0.35
        return (
          <group>
            <BoxPiece
              size={[obstacle.width, shelfHeight, obstacle.depth]}
              position={[0, shelfHeight / 2, 0]}
            />
            <BoxPiece
              size={[obstacle.width * 0.9, obstacle.height * 0.2, obstacle.depth * 0.6]}
              position={[0, shelfHeight + obstacle.height * 0.1, 0]}
              pieceColor={accentColor}
            />
          </group>
        )
      }
      case 'kitchen-cabinets': {
        const baseHeight = obstacle.height * 0.55
        const upperHeight = obstacle.height * 0.3
        const upperDepth = obstacle.depth * 0.7
        return (
          <group>
            <BoxPiece
              size={[obstacle.width, baseHeight, obstacle.depth]}
              position={[0, baseHeight / 2, 0]}
            />
            <BoxPiece
              size={[obstacle.width * 0.95, upperHeight, upperDepth]}
              position={[
                0,
                baseHeight + upperHeight / 2 + obstacle.height * 0.05,
                -obstacle.depth * 0.1,
              ]}
              pieceColor={accentColor}
            />
          </group>
        )
      }
      case 'closet': {
        const trimHeight = obstacle.height * 0.08
        return (
          <group>
            <BoxPiece
              size={[obstacle.width, obstacle.height, obstacle.depth]}
              position={[0, obstacle.height / 2, 0]}
            />
            <BoxPiece
              size={[obstacle.width, trimHeight, obstacle.depth]}
              position={[0, obstacle.height - trimHeight / 2, 0]}
              pieceColor={accentColor}
            />
          </group>
        )
      }
      case 'vanity': {
        const baseHeight = obstacle.height * 0.6
        const topHeight = obstacle.height * 0.2
        return (
          <group>
            <BoxPiece
              size={[obstacle.width, baseHeight, obstacle.depth]}
              position={[0, baseHeight / 2, 0]}
            />
            <BoxPiece
              size={[obstacle.width, topHeight, obstacle.depth * 0.9]}
              position={[0, baseHeight + topHeight / 2, 0]}
              pieceColor={accentColor}
            />
          </group>
        )
      }
      case 'shower': {
        const glassThickness = Math.max(0.05, obstacle.width * 0.05)
        return (
          <group>
            <BoxPiece
              size={[obstacle.width, obstacle.height, obstacle.depth]}
              position={[0, obstacle.height / 2, 0]}
            />
            <BoxPiece
              size={[glassThickness, obstacle.height, obstacle.depth]}
              position={[obstacle.width / 2 - glassThickness / 2, obstacle.height / 2, 0]}
              pieceColor="#CDE8F5"
            />
          </group>
        )
      }
      case 'mirror': {
        return (
          <group>
            <BoxPiece
              size={[obstacle.width, obstacle.height, Math.max(0.05, obstacle.depth)]}
              position={[0, obstacle.height / 2, 0]}
              pieceColor="#E7EEF5"
            />
          </group>
        )
      }
      case 'window': {
        const frameThickness = Math.max(0.08, obstacle.depth)
        return (
          <group>
            <BoxPiece
              size={[obstacle.width, obstacle.height, frameThickness]}
              position={[0, obstacle.height / 2, 0]}
              pieceColor="#9ABAD6"
            />
            <BoxPiece
              size={[obstacle.width * 0.8, obstacle.height * 0.75, frameThickness * 0.6]}
              position={[0, obstacle.height / 2, 0]}
              pieceColor="#D9EEF9"
            />
          </group>
        )
      }
      case 'wall-lamps':
      case 'hidden-lights':
      case 'ceiling-light': {
        return (
          <group>
            <BoxPiece
              size={[obstacle.width, obstacle.height, obstacle.depth]}
              position={[0, obstacle.height / 2, 0]}
              pieceColor="#FCE9A3"
            />
          </group>
        )
      }
      default:
        return (
          <BoxPiece
            size={[obstacle.width, obstacle.height, obstacle.depth]}
            position={[0, obstacle.height / 2, 0]}
          />
        )
    }
  }

  return (
    <group position={[positionX, baseY, positionZ]}>
      {renderObstacle()}
    </group>
  )
}

export function RoomScene({
  width,
  length,
  height,
  obstacles,
  activeObstacleIds,
  light,
}: RoomSceneProps) {
  const filteredObstacles = useMemo(
    () => obstacles.filter((item) => activeObstacleIds.includes(item.id)),
    [obstacles, activeObstacleIds],
  )

  const lightColor = useMemo(
    () => (light ? kelvinToColor(light.cct || 3000) : new Color('#FFE8B5')),
    [light],
  )

  const intensity = useMemo(() => {
    if (!light?.lumen) return 0.6
    return clamp(light.lumen / 900, 0.4, 3)
  }, [light])

  const spotAngle = useMemo(() => {
    if (!light?.angle) return MathUtils.degToRad(50)
    const safeAngle = clamp(light.angle, 20, 160)
    return MathUtils.degToRad(safeAngle / 2)
  }, [light])

  const distance = useMemo(
    () => Math.max(width, length) * 1.4,
    [width, length],
  )

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [0, height * 1.1, length * 1.2], fov: 45 }}
      className="h-full w-full"
    >
      <color attach="background" args={['#0B1C2D']} />
      <ambientLight intensity={0.35} color="#ffffff" />
      <spotLight
        position={[0, height - 0.1, 0]}
        intensity={intensity}
        angle={spotAngle}
        penumbra={0.35}
        color={lightColor}
        castShadow
        distance={distance}
        decay={2}
      />
      <pointLight
        position={[width / 3, height - 0.2, -length / 3]}
        intensity={0.3}
        color={lightColor}
      />

      <RoomShell width={width} length={length} height={height} />
      {filteredObstacles.map((obstacle) => (
        <Obstacle
          key={obstacle.id}
          obstacle={obstacle}
          roomWidth={width}
          roomLength={length}
          roomHeight={height}
        />
      ))}

      <OrbitControls
        enablePan={false}
        minDistance={Math.max(width, length) * 0.6}
        maxDistance={Math.max(width, length) * 2}
        minPolarAngle={MathUtils.degToRad(20)}
        maxPolarAngle={MathUtils.degToRad(85)}
      />
    </Canvas>
  )
}
