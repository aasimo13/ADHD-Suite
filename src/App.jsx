import Dashboard from './pages/Dashboard'
import './App.css'
import { DashboardProvider } from './context/DashboardContext'

function App() {
  return (
    <DashboardProvider>
      <div className="App">
        <Dashboard />
      </div>
    </DashboardProvider>
  )
}

export default App
