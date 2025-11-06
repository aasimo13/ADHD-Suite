import { useMemo, useState } from 'react'
import { useDashboard, getTodayKey } from '../context/DashboardContext'

const moods = [
  { id: 'energized', label: '⚡ Energized' },
  { id: 'steady', label: '😊 Steady' },
  { id: 'foggy', label: '🌫️ Foggy' },
  { id: 'anxious', label: '😰 Anxious' },
  { id: 'low', label: '🪫 Low battery' }
]

const PlanningPrompts = () => {
  const today = getTodayKey()
  const { state, dispatch } = useDashboard()
  const [selectedDate, setSelectedDate] = useState(today)
  const [customPrompt, setCustomPrompt] = useState('')
  const responsesForDate = state.promptResponses[selectedDate] || {}
  const mood = state.moodCheckins[selectedDate] || ''

  const availableDates = useMemo(() => {
    const keys = Object.keys(state.promptResponses)
    if (!keys.includes(today)) {
      keys.push(today)
    }
    return keys.sort().reverse()
  }, [state.promptResponses, today])

  const handleResponseChange = (promptId, value) => {
    dispatch({
      type: 'UPDATE_PROMPT_RESPONSE',
      payload: {
        date: selectedDate,
        promptId,
        value
      }
    })
  }

  const handleMoodSelect = (moodId) => {
    dispatch({
      type: 'SET_MOOD',
      payload: {
        date: selectedDate,
        mood: moodId
      }
    })
  }

  const handleAddPrompt = () => {
    if (!customPrompt.trim()) return
    dispatch({
      type: 'ADD_PROMPT',
      payload: {
        id: `custom-${Date.now()}`,
        text: customPrompt.trim()
      }
    })
    setCustomPrompt('')
  }

  return (
    <section className="card planning-section">
      <div className="section-header">
        <h2>Daily Planning Studio</h2>
        <div className="date-selector">
          <label htmlFor="planning-date">Review date</label>
          <select
            id="planning-date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          >
            {availableDates.map((dateKey) => (
              <option key={dateKey} value={dateKey}>
                {new Date(dateKey).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mood-checkin">
        <span className="label">How are you arriving?</span>
        <div className="mood-buttons">
          {moods.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`chip ${mood === option.id ? 'active' : ''}`}
              onClick={() => handleMoodSelect(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="questions-list">
        {state.prompts.map((prompt) => (
          <div key={prompt.id} className="question-item">
            <div className="question-meta">
              <p className="question">{prompt.text}</p>
            </div>
            <textarea
              placeholder="Capture your thoughts..."
              rows="3"
              value={responsesForDate[prompt.id] || ''}
              onChange={(event) => handleResponseChange(prompt.id, event.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="custom-prompt">
        <label htmlFor="custom-prompt-input">Add a prompt that resonates today</label>
        <div className="custom-prompt-input">
          <input
            id="custom-prompt-input"
            type="text"
            value={customPrompt}
            onChange={(event) => setCustomPrompt(event.target.value)}
            placeholder="E.g. What support do I need before noon?"
          />
          <button type="button" className="btn" onClick={handleAddPrompt}>
            Add prompt
          </button>
        </div>
      </div>
    </section>
  )
}

export default PlanningPrompts
