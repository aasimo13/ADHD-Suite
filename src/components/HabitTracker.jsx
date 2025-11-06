import { useState } from 'react'
import { useDashboard, getTodayKey } from '../context/DashboardContext'

const HabitTracker = () => {
  const { state, dispatch } = useDashboard()
  const today = getTodayKey()
  const [habitName, setHabitName] = useState('')

  const toggleHabit = (habitId) => {
    dispatch({
      type: 'TOGGLE_HABIT',
      payload: {
        date: today,
        habitId
      }
    })
  }

  const addHabit = (event) => {
    event.preventDefault()
    if (!habitName.trim()) return
    dispatch({
      type: 'ADD_HABIT',
      payload: {
        id: `habit-${Date.now()}`,
        name: habitName.trim(),
        streak: 0
      }
    })
    setHabitName('')
  }

  const removeHabit = (habitId) => {
    dispatch({ type: 'REMOVE_HABIT', payload: habitId })
  }

  const todaysLog = state.habitLog[today] || {}

  return (
    <section className="card habits-section">
      <div className="section-header">
        <h2>Habit Anchors</h2>
        <p className="section-subtitle">Build gentle streaks tailored for your rhythms</p>
      </div>
      <form className="habit-form" onSubmit={addHabit}>
        <input
          type="text"
          placeholder="Add supportive habit"
          value={habitName}
          onChange={(event) => setHabitName(event.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          Add
        </button>
      </form>
      <ul className="habits-list">
        {state.habits.length === 0 && <p className="empty-state">Add habits to track your daily routines</p>}
        {state.habits.map((habit) => (
          <li key={habit.id} className="habit-item">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={Boolean(todaysLog[habit.id])}
                onChange={() => toggleHabit(habit.id)}
              />
              <span>{habit.name}</span>
            </label>
            <div className="habit-meta">
              <span className="streak">🔥 {habit.streak} day streak</span>
              <button type="button" className="btn small" onClick={() => removeHabit(habit.id)}>
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default HabitTracker
