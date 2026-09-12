import { BodhiAPI } from '../shared/types'

declare global {
  interface Window {
    bodhiAPI: BodhiAPI
  }
}

export {}
