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
  const audio = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const el = audio.current
    if (!el) return
    const target = el
    let started = false

    el.play()
      .then(() => {
        started = true
        setPlaying(true)
      })
      .catch(() => {})

    function tryPlay() {
      if (started) return
      target.play().then(() => {
        started = true
        setPlaying(true)
      }).catch(() => {})
    }

    const opts = { capture: true, passive: true }
    const events = ['pointerdown', 'touchstart', 'click', 'keydown', 'scroll']
    events.forEach((e) => window.addEventListener(e, tryPlay, opts))
    return () => {
      events.forEach((e) => window.removeEventListener(e, tryPlay, opts))
    }
  }, [])

  function toggle() {
    const el = audio.current
    if (!el) return
    if (playing) {
      el.pause()
      setPlaying(false)
    } else {
      el.play()
        .then(() => setPlaying(true))
        .catch(() => {})
    }
  }

  return (
    <>
      <audio ref={audio} src={`${import.meta.env.BASE_URL}birthday-song.mp3`} loop preload="auto" />
      <button className="bd-song-btn" onClick={toggle} aria-label="birthday song">
        {playing ? '❚❚' : '▶'}
      </button>
      {!playing && <span className="bd-song-hint">tap anywhere · music ♪</span>}
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
