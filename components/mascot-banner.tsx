"use client"

import { useEffect, useState, useRef } from "react"
import { Sparkles, Users, Calendar, Bell, Heart } from "lucide-react"

interface Message {
  icon: any
  text: string
  color: string
}

export function MascotBanner({
  smileSrc = "/mascot-smile.svg",
  teethSrc = "/mascot-teeth.svg",
}: {
  smileSrc?: string
  teethSrc?: string
}) {
  const messages: Message[] = [
    { icon: Sparkles, text: "Welcome to Fall Semester!", color: "bg-purple-100 border-purple-300" },
    { icon: Users, text: "Soccer tryouts Friday @ 4pm", color: "bg-blue-100 border-blue-300" },
    { icon: Calendar, text: "Drama club is recruiting!", color: "bg-pink-100 border-pink-300" },
    { icon: Bell, text: "Library hours extended for finals", color: "bg-green-100 border-green-300" },
    { icon: Heart, text: "Pizza social tonight @ commons!", color: "bg-orange-100 border-orange-300" },
  ]

  const [currentMessage, setCurrentMessage] = useState(0)
  const [showMessage, setShowMessage] = useState(true)
  const [hovered, setHovered] = useState(false)
  const pointerLock = useRef(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setShowMessage(false)
      setTimeout(() => {
        setCurrentMessage((prev) => (prev + 1) % messages.length)
        setShowMessage(true)
      }, 300)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // handle touch interactions on mobile (toggle)
  const handleTouch = () => {
    // simple tap toggle to show teeth briefly
    if (pointerLock.current) return
    pointerLock.current = true
    setHovered(true)
    setTimeout(() => {
      setHovered(false)
      pointerLock.current = false
    }, 900)
  }

  const Icon = messages[currentMessage].icon

  return (
    <div className="mascot-banner flex flex-col items-center w-full">
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.02) translateY(-4px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(1deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .mascot-wrap { animation: breathe 3800ms ease-in-out infinite; }
        .mascot-float { animation: float 6000ms ease-in-out infinite; }
        .mascot-img { width: 96px; height: auto; max-width: 25vw; }
        .mascot-bubble { transition: opacity 220ms ease, transform 220ms ease; }
        @media (prefers-reduced-motion: reduce) {
          .mascot-wrap, .mascot-float { animation: none !important; }
        }
      `}</style>

      <div
        className="relative mascot-wrap mascot-float flex items-center justify-center"
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onTouchStart={handleTouch}
        role="img"
        aria-label="Mascot"
      >
        {/* messages bubble above mascot */}
        <div className="absolute -top-14 left-1/2 transform -translate-x-1/2">{
          <div
            className={`mascot-bubble px-3 py-2 rounded-lg border text-xs sm:text-sm flex items-center gap-2 ${messages[currentMessage].color} ${showMessage ? 'opacity-100 pointer-events-auto animate-[fadeInUp_220ms_ease]' : 'opacity-0 pointer-events-none'}`}
          >
            <Icon className="h-4 w-4" />
            <span className="whitespace-nowrap">{messages[currentMessage].text}</span>
          </div>
        }</div>

        {/* two images stacked; switch by opacity */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
          <img
            src={smileSrc}
            alt="Mascot smile"
            className={`mascot-img transition-opacity duration-300 ${hovered ? 'opacity-0' : 'opacity-100'}`}
            draggable={false}
            aria-hidden
          />
          <img
            src={teethSrc}
            alt="Mascot teeth smile"
            className={`mascot-img absolute top-0 left-0 transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}
            draggable={false}
            aria-hidden
          />
        </div>
      </div>
    </div>
  )
}
