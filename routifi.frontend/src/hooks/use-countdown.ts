import { useState, useEffect, useCallback } from "react"

export function useCountdown(initialSeconds = 30) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isActive, setIsActive] = useState(true)

  const formatTime = useCallback((secs: number) => {
    const minutes = Math.floor(secs / 60)
    const remainingSeconds = secs % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }, [])

  const stopTimer = useCallback(() => {
    setIsActive(false)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1)
      }, 1000)
    } else if (seconds === 0) {
      setIsActive(false)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, seconds])

  return {
    seconds,
    formattedTime: formatTime(seconds),
    isActive,
    stopTimer,
  }
}

