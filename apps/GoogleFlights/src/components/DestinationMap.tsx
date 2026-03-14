import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ExploreDestination } from '../slices/exploreSlice'
import './DestinationMap.css'

interface DestinationMapProps {
  destinations: ExploreDestination[]
  loading: boolean
  originCode: string | null
}

interface ViewBox {
  x: number
  y: number
  width: number
  height: number
}

// Convert lat/lng to map coordinates (simple equirectangular projection)
function toMapCoords(lat: number, lng: number) {
  const x = ((lng + 180) / 360) * 1000
  const y = ((90 - lat) / 180) * 500
  return { x, y }
}

// Simple world map outline paths (simplified continents)
const WORLD_PATHS = [
  // North America
  'M 100,100 L 140,80 L 180,75 L 220,85 L 240,100 L 260,120 L 270,140 L 260,160 L 240,180 L 220,200 L 180,210 L 160,200 L 140,180 L 120,160 L 100,140 Z',
  // South America
  'M 200,220 L 220,210 L 240,220 L 250,250 L 250,280 L 240,310 L 230,340 L 220,360 L 210,370 L 200,350 L 190,320 L 185,290 L 190,260 Z',
  // Europe
  'M 460,80 L 480,70 L 510,75 L 530,85 L 520,100 L 540,110 L 520,120 L 500,115 L 480,120 L 460,110 Z',
  // Africa
  'M 460,140 L 490,130 L 520,140 L 540,160 L 550,190 L 545,220 L 535,260 L 520,280 L 500,290 L 480,280 L 470,260 L 460,230 L 455,200 L 450,170 Z',
  // Asia
  'M 540,60 L 580,50 L 630,55 L 680,60 L 730,70 L 760,80 L 780,100 L 770,120 L 740,130 L 700,140 L 660,145 L 620,140 L 580,130 L 550,120 L 540,100 Z',
  // Australia
  'M 720,260 L 760,250 L 800,255 L 820,270 L 815,290 L 800,305 L 780,310 L 755,305 L 735,295 L 720,280 Z',
]

function DestinationMap({ destinations, loading, originCode }: DestinationMapProps) {
  const navigate = useNavigate()
  const [hoveredDest, setHoveredDest] = useState<string | null>(null)
  const [viewBox, setViewBox] = useState<ViewBox>({ x: 0, y: 0, width: 1000, height: 500 })
  const svgRef = useRef<SVGSVGElement>(null)
  const isPanning = useRef(false)
  const panStart = useRef({ x: 0, y: 0 })

  const handleDestClick = useCallback((dest: ExploreDestination) => {
    const params = new URLSearchParams({
      origin: originCode || '',
      destination: dest.iata_code,
    })
    navigate(`/results?${params.toString()}`)
  }, [navigate, originCode])

  const handleZoom = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const factor = e.deltaY > 0 ? 1.1 : 0.9
    setViewBox((prev) => {
      const newWidth = Math.max(200, Math.min(1000, prev.width * factor))
      const newHeight = Math.max(100, Math.min(500, prev.height * factor))
      const cx = prev.x + prev.width / 2
      const cy = prev.y + prev.height / 2
      return {
        x: Math.max(0, cx - newWidth / 2),
        y: Math.max(0, cy - newHeight / 2),
        width: newWidth,
        height: newHeight,
      }
    })
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isPanning.current = true
    panStart.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current || !svgRef.current) return
    const svg = svgRef.current
    const rect = svg.getBoundingClientRect()
    const scaleX = viewBox.width / rect.width
    const scaleY = viewBox.height / rect.height
    const dx = (panStart.current.x - e.clientX) * scaleX
    const dy = (panStart.current.y - e.clientY) * scaleY
    panStart.current = { x: e.clientX, y: e.clientY }
    setViewBox((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(800, prev.x + dx)),
      y: Math.max(0, Math.min(400, prev.y + dy)),
    }))
  }, [viewBox.width, viewBox.height])

  const handleMouseUp = useCallback(() => {
    isPanning.current = false
  }, [])

  const handleZoomIn = useCallback(() => {
    setViewBox((prev) => {
      const newWidth = Math.max(200, prev.width * 0.8)
      const newHeight = Math.max(100, prev.height * 0.8)
      const cx = prev.x + prev.width / 2
      const cy = prev.y + prev.height / 2
      return {
        x: Math.max(0, cx - newWidth / 2),
        y: Math.max(0, cy - newHeight / 2),
        width: newWidth,
        height: newHeight,
      }
    })
  }, [])

  const handleZoomOut = useCallback(() => {
    setViewBox((prev) => {
      const newWidth = Math.min(1000, prev.width * 1.25)
      const newHeight = Math.min(500, prev.height * 1.25)
      const cx = prev.x + prev.width / 2
      const cy = prev.y + prev.height / 2
      return {
        x: Math.max(0, cx - newWidth / 2),
        y: Math.max(0, cy - newHeight / 2),
        width: newWidth,
        height: newHeight,
      }
    })
  }, [])

  const handleResetZoom = useCallback(() => {
    setViewBox({ x: 0, y: 0, width: 1000, height: 500 })
  }, [])

  return (
    <div className="destination-map" data-testid="destination-map">
      <div className="destination-map__controls" data-testid="destination-map-controls">
        <button
          className="destination-map__zoom-btn"
          onClick={handleZoomIn}
          data-testid="destination-map-zoom-in"
          title="Zoom in"
        >
          +
        </button>
        <button
          className="destination-map__zoom-btn"
          onClick={handleZoomOut}
          data-testid="destination-map-zoom-out"
          title="Zoom out"
        >
          −
        </button>
        <button
          className="destination-map__zoom-btn"
          onClick={handleResetZoom}
          data-testid="destination-map-reset"
          title="Reset view"
        >
          ⟳
        </button>
      </div>

      {loading && (
        <div className="destination-map__loading" data-testid="destination-map-loading">
          <div className="destination-map__spinner" />
          <span>Loading destinations...</span>
        </div>
      )}

      <svg
        ref={svgRef}
        className="destination-map__svg"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        preserveAspectRatio="xMidYMid meet"
        onWheel={handleZoom}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        data-testid="destination-map-svg"
      >
        {/* Background */}
        <rect x="0" y="0" width="1000" height="500" fill="#E8F4FD" />

        {/* Continent outlines */}
        {WORLD_PATHS.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="#D4E6D9"
            stroke="#B8D4BE"
            strokeWidth="1"
          />
        ))}

        {/* Destination markers */}
        {!loading && destinations.map((dest) => {
          const coords = toMapCoords(dest.latitude, dest.longitude)
          const isHovered = hoveredDest === dest.id
          return (
            <g
              key={dest.id}
              className="destination-map__marker"
              onClick={() => handleDestClick(dest)}
              onMouseEnter={() => setHoveredDest(dest.id)}
              onMouseLeave={() => setHoveredDest(null)}
              data-testid={`destination-marker-${dest.iata_code}`}
              style={{ cursor: 'pointer' }}
            >
              {/* Marker pin */}
              <circle
                cx={coords.x}
                cy={coords.y}
                r={isHovered ? 6 : 4}
                fill="var(--color-primary)"
                stroke="white"
                strokeWidth="1.5"
              />
              {/* Price tag */}
              <rect
                x={coords.x - 24}
                y={coords.y - 26}
                width={48}
                height={18}
                rx={4}
                fill={isHovered ? 'var(--color-primary)' : 'var(--color-surface)'}
                stroke={isHovered ? 'var(--color-primary)' : 'var(--color-border)'}
                strokeWidth="0.5"
              />
              <text
                x={coords.x}
                y={coords.y - 14}
                textAnchor="middle"
                fontSize="8"
                fontWeight="600"
                fill={isHovered ? 'white' : 'var(--color-text-primary)'}
              >
                ${dest.lowest_price}
              </text>

              {/* Tooltip on hover */}
              {isHovered && (
                <g data-testid={`destination-tooltip-${dest.iata_code}`}>
                  <rect
                    x={coords.x - 55}
                    y={coords.y + 10}
                    width={110}
                    height={40}
                    rx={4}
                    fill="var(--color-text-primary)"
                    opacity="0.95"
                  />
                  <text
                    x={coords.x}
                    y={coords.y + 25}
                    textAnchor="middle"
                    fontSize="7"
                    fontWeight="600"
                    fill="white"
                  >
                    {dest.city} ({dest.iata_code})
                  </text>
                  <text
                    x={coords.x}
                    y={coords.y + 36}
                    textAnchor="middle"
                    fontSize="6"
                    fill="#B8BFC6"
                  >
                    from ${dest.lowest_price} · {dest.airline_name}
                  </text>
                </g>
              )}
            </g>
          )
        })}

        {/* Empty state */}
        {!loading && destinations.length === 0 && originCode && (
          <text
            x="500"
            y="250"
            textAnchor="middle"
            fontSize="14"
            fill="var(--color-text-secondary)"
            data-testid="destination-map-empty"
          >
            No destinations found from this airport
          </text>
        )}
      </svg>
    </div>
  )
}

export default DestinationMap
