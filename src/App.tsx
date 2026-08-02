import { useEffect, useMemo, useRef, useState } from 'react'
import { PullCord } from 'pullcord'
import 'pullcord/pullcord.css'
import { DeskFolio } from './deskfolio/deskfolio'
import './deskfolio/deskfolio.css'
import './App.css'

const balloonColors = ['#ffd6e8', '#ffe9c7', '#e6d9ff', '#ffc7d1', '#fff0d1']
const confettiColors = ['#ffd6e8', '#ffd98a', '#c9b6ff', '#ff9fb3', '#ffeaa7']

function Balloons() {
  const balloons = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        left: (i * 10 + Math.floor(Math.random() * 6)) % 96,
        size: 16 + Math.floor(Math.random() * 12),
        delay: Math.random() * 8,
        duration: 10 + Math.random() * 6,
        color: balloonColors[i % balloonColors.length],
      })),
    []
  )

  return (
    <div className="bd-balloons">
      {balloons.map((b, i) => (
        <span
          key={i}
          className="bd-balloon"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size * 1.25,
            background: b.color,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        left: (i * 5.5 + Math.floor(Math.random() * 8)) % 97,
        delay: Math.random() * 7,
        duration: 6 + Math.random() * 5,
        color: confettiColors[i % confettiColors.length],
        size: 5 + Math.floor(Math.random() * 5),
        tilt: Math.floor(Math.random() * 90),
      })),
    []
  )

  return (
    <div className="bd-confetti">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="bd-confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            transform: `rotate(${p.tilt}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

function BirthdaySong() {
  const ctxRef = useRef<AudioContext | null>(null)
  const bufferRef = useRef<AudioBuffer | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const playingRef = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)

  function start() {
    if (playingRef.current) return
    const ctx = ctxRef.current
    if (!ctx || !bufferRef.current) return
    ctx.resume()
      .then(() => {
        if (playingRef.current || !bufferRef.current) return
        const src = ctx.createBufferSource()
        src.buffer = bufferRef.current
        src.loop = true
        src.connect(ctx.destination)
        src.start()
        sourceRef.current = src
        playingRef.current = true
        setPlaying(true)
      })
      .catch(() => {})
  }

  useEffect(() => {
    let cancelled = false
    const Ctx: typeof AudioContext =
      window.AudioContext || (window as any).webkitAudioContext
    const ctx = new Ctx()
    ctxRef.current = ctx

    fetch(`${import.meta.env.BASE_URL}birthday-song.mp3`)
      .then((r) => r.arrayBuffer())
      .then((buf) => ctx.decodeAudioData(buf))
      .then((audioBuf) => {
        if (cancelled) return
        bufferRef.current = audioBuf
        setReady(true)
      })
      .catch(() => {})

    const opts = { capture: true, passive: true }
    const events = ['pointerdown', 'touchstart', 'click', 'keydown', 'scroll']
    events.forEach((e) => window.addEventListener(e, start, opts))
    return () => {
      cancelled = true
      events.forEach((e) => window.removeEventListener(e, start, opts))
      ctx.close().catch(() => {})
    }
  }, [])

  function toggle() {
    const ctx = ctxRef.current
    if (!ctx) return
    if (playingRef.current) {
      ctx.suspend()
      playingRef.current = false
      setPlaying(false)
    } else {
      start()
    }
  }

  return (
    <>
      <button className="bd-song-btn" onClick={toggle} aria-label="birthday song">
        {playing ? '❚❚' : '▶'}
      </button>
      {!playing && ready && <span className="bd-song-hint">tap anywhere · music ♪</span>}
    </>
  )
}

export default function App() {
  const [lightsOn, setLightsOn] = useState(true)

  return (
    <div className={lightsOn ? 'room' : 'room room--dark'}>
      <Balloons />
      <Confetti />
      <DeskFolio />
      <div className="room-dim" aria-hidden="true" />
      <PullCord
        onPull={() => setLightsOn((on) => !on)}
        pulled={!lightsOn}
        ariaLabel="Toggle the room light"
      />
      <BirthdaySong />
    </div>
  )
}
