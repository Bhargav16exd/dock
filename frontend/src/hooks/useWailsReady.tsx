import { useEffect, useState } from "react"

export function useWailsReady() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const check = () => {
      if ((window as any).runtime?.EventsOnMultiple) {
        setReady(true)
      } else {
        setTimeout(check, 50)
      }
    }
    check()
  }, [])

  return ready
}