import type { DependencyList } from "react"

import { useEffect, useRef, useState } from "react"
import { AppState } from "react-native"

type UseAppStateOpts<T> = {
  onForeground?: (deps: T) => void
  onBackground?: (deps: T) => void
}

export function useAppState<T extends DependencyList>(opts: UseAppStateOpts<T>, deps: T = [] as unknown as T) {
  const prevAppState = useRef(AppState.currentState)
  const [appState, setAppState] = useState(prevAppState.current)

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (prevAppState.current.match(/inactive|background/) && nextAppState === "active") {
        opts?.onForeground?.(deps)
      }

      if (prevAppState.current === "active" && nextAppState !== "active") {
        opts?.onBackground?.(deps)
      }

      prevAppState.current = nextAppState
      setAppState(prevAppState.current)
    })

    return () => {
      subscription.remove()
    }
  }, deps)

  return appState
}
