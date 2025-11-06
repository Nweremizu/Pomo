import { Router } from '../../lib/electron-router-dom'
import { Route } from 'react-router-dom'
import App from '@renderer/App'
import MiniPlayer from '@renderer/routes/mini'

export function Routes(): React.JSX.Element {
  return (
    <Router
      main={<Route path="/" element={<App />} />}
      mini={<Route path="/" element={<MiniPlayer />} />}
    />
  )
}
