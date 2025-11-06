import type { ElectronAPI as ElectronAPIType } from '../../../shared/ipc-types'
import type { ElectronAPI as BaseElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: BaseElectronAPI
    api: ElectronAPIType
  }
}

export {}
