import { useEffect, useMemo, useRef, useState } from 'react'
import { useDashboard } from '../context/DashboardContext'

const PomodoroTimer = () => {
  const { state, dispatch } = useDashboard()
  const { timerSettings, timerState } = state
  const intervalRef = useRef(null)
  const latestState = useRef(timerState)
  const latestSettings = useRef(timerSettings)
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    latestState.current = timerState
  }, [timerState])

  useEffect(() => {
    latestSettings.current = timerSettings
  }, [timerSettings])

  useEffect(() => {
    if (!timerState.isRunning) {
      clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      const nextState = getNextTickState(latestState.current, latestSettings.current, soundEnabled)
      dispatch({
        type: 'SET_TIMER_STATE',
        payload: nextState
      })
      latestState.current = { ...latestState.current, ...nextState }
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [timerState.isRunning, dispatch, soundEnabled])

  const formattedTime = useMemo(() => formatTime(timerState.secondsRemaining), [timerState.secondsRemaining])

  const handleStartPause = () => {
    dispatch({
      type: 'SET_TIMER_STATE',
      payload: { isRunning: !timerState.isRunning }
    })
  }

  const handleReset = () => {
    dispatch({
      type: 'SET_TIMER_STATE',
      payload: {
        mode: 'focus',
        isRunning: false,
        secondsRemaining: timerSettings.focus * 60,
        sessionCount: 0,
        completedSessions: []
      }
    })
  }

  const handleSettingsChange = (key, value) => {
    const parsed = Number(value)
    if (Number.isNaN(parsed) || parsed <= 0) return
    dispatch({
      type: 'UPDATE_TIMER_SETTINGS',
      payload: { [key]: parsed }
    })
  }

  const sessionsToday = timerState.completedSessions.filter((session) => {
    const sessionDate = new Date(session.completedAt).toDateString()
    return sessionDate === new Date().toDateString()
  })

  return (
    <section className="card pomodoro-section">
      <div className="section-header">
        <h2>Pomodoro Focus Studio</h2>
        <div className={`mode-pill ${timerState.mode}`}>
          {timerState.mode === 'focus' ? 'Focus' : timerState.mode === 'long-break' ? 'Long break' : 'Short break'}
        </div>
      </div>

      <div className="timer-display">
        <div className="time">{formattedTime}</div>
        <div className="timer-controls">
          <button className="btn btn-primary" onClick={handleStartPause}>
            {timerState.isRunning ? 'Pause' : 'Start'}
          </button>
          <button className="btn" onClick={handleReset}>
            Reset
          </button>
        </div>
        <label className="sound-toggle">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(event) => setSoundEnabled(event.target.checked)}
          />
          Celebration chime
        </label>
      </div>

      <div className="timer-settings">
        <SettingField
          id="focus-length"
          label="Focus"
          value={timerSettings.focus}
          onChange={(value) => handleSettingsChange('focus', value)}
        />
        <SettingField
          id="break-length"
          label="Break"
          value={timerSettings.shortBreak}
          onChange={(value) => handleSettingsChange('shortBreak', value)}
        />
        <SettingField
          id="long-break-length"
          label="Long break"
          value={timerSettings.longBreak}
          onChange={(value) => handleSettingsChange('longBreak', value)}
        />
        <SettingField
          id="long-break-interval"
          label="Sessions / long break"
          value={timerSettings.longBreakInterval}
          onChange={(value) => handleSettingsChange('longBreakInterval', value)}
        />
      </div>

      <div className="session-summary">
        <div>
          <span className="summary-count">{sessionsToday.length}</span>
          <p>focus sessions logged today</p>
        </div>
        <ul className="session-log">
          {timerState.completedSessions.slice(-4).map((session) => (
            <li key={session.completedAt}>
              <span>{new Date(session.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span>{session.duration} min focus</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

const SettingField = ({ id, label, value, onChange }) => (
  <label htmlFor={id} className="setting-field">
    <span>{label}</span>
    <input
      id={id}
      type="number"
      min="1"
      max="180"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
    <span className="unit">min</span>
  </label>
)

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const getNextTickState = (timerState, timerSettings, soundEnabled) => {
  if (timerState.secondsRemaining > 0) {
    return {
      ...timerState,
      secondsRemaining: timerState.secondsRemaining - 1
    }
  }

  const completedSessions = timerState.mode === 'focus'
    ? [
        ...timerState.completedSessions,
        { completedAt: Date.now(), duration: timerSettings.focus }
      ]
    : timerState.completedSessions

  if (soundEnabled && typeof window !== 'undefined') {
    playChime()
  }

  if (timerState.mode === 'focus') {
    const nextSessionCount = timerState.sessionCount + 1
    const isLongBreak = nextSessionCount % timerSettings.longBreakInterval === 0
    return {
      mode: isLongBreak ? 'long-break' : 'short-break',
      isRunning: true,
      secondsRemaining: (isLongBreak ? timerSettings.longBreak : timerSettings.shortBreak) * 60,
      sessionCount: nextSessionCount,
      completedSessions
    }
  }

  return {
    mode: 'focus',
    isRunning: true,
    secondsRemaining: timerSettings.focus * 60,
    sessionCount: timerState.sessionCount,
    completedSessions
  }
}

const playChime = () => {
  const synth = window.speechSynthesis
  if (synth) {
    const utter = new SpeechSynthesisUtterance('Session complete! Take a moment to check in.')
    synth.speak(utter)
  }
}

export default PomodoroTimer
