import { useMemo } from 'react'
import PlanningPrompts from '../components/PlanningPrompts'
import PomodoroTimer from '../components/PomodoroTimer'
import TaskManager from '../components/TaskManager'
import SchedulePlanner from '../components/SchedulePlanner'
import NotesPanel from '../components/NotesPanel'
import HabitTracker from '../components/HabitTracker'
import PrintSchedule from '../components/PrintSchedule'
import { useDashboard, getTodayKey } from '../context/DashboardContext'
import './Dashboard.css'

const Dashboard = () => {
  const { state } = useDashboard()
  const today = getTodayKey()

  const dashboardDate = useMemo(
    () =>
      new Date(today).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      }),
    [today]
  )

  const completedToday = state.timerState.completedSessions.filter((session) => {
    const sessionDate = new Date(session.completedAt).toLocaleDateString()
    return sessionDate === new Date().toLocaleDateString()
  }).length

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>ADHD Task Center</h1>
          <p className="date">{dashboardDate}</p>
        </div>
        <div className="header-actions">
          <div className="daily-metrics">
            <div>
              <span className="metric-value">{completedToday}</span>
              <span className="metric-label">Focus sprints</span>
            </div>
            <div>
              <span className="metric-value">{state.tasks.filter((task) => task.completed).length}</span>
              <span className="metric-label">Tasks done</span>
            </div>
            <div>
              <span className="metric-value">{Object.values(state.habitLog[today] || {}).filter(Boolean).length}</span>
              <span className="metric-label">Habits checked</span>
            </div>
          </div>
          <PrintSchedule />
        </div>
      </header>

      <div className="container">
        <div className="dashboard-grid">
          <PlanningPrompts />
          <PomodoroTimer />
          <TaskManager />
          <SchedulePlanner />
          <NotesPanel />
          <HabitTracker />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
