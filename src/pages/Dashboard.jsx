import { useState } from 'react'
import './Dashboard.css'

const Dashboard = () => {
  const [currentDate] = useState(new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }))

  const planningQuestions = [
    "What are my top 3 priorities for today?",
    "What would make today feel successful?",
    "What's the one thing I absolutely need to accomplish?",
    "What potential distractions should I be aware of?",
    "How am I feeling right now, and what do I need?"
  ]

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>ADHD Task Center</h1>
        <p className="date">{currentDate}</p>
      </header>

      <div className="container">
        <div className="dashboard-grid">
          {/* Planning Questions Section */}
          <section className="card planning-section">
            <h2>Daily Planning Questions</h2>
            <div className="questions-list">
              {planningQuestions.map((question, index) => (
                <div key={index} className="question-item">
                  <p className="question">{question}</p>
                  <textarea
                    placeholder="Your answer..."
                    rows="2"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Pomodoro Timer Section */}
          <section className="card pomodoro-section">
            <h2>Pomodoro Timer</h2>
            <div className="timer-display">
              <div className="time">25:00</div>
              <div className="timer-controls">
                <button className="btn btn-primary">Start</button>
                <button className="btn">Reset</button>
              </div>
            </div>
            <div className="timer-settings">
              <label>
                Focus: <input type="number" defaultValue="25" min="1" max="60" /> min
              </label>
              <label>
                Break: <input type="number" defaultValue="5" min="1" max="30" /> min
              </label>
            </div>
          </section>

          {/* Task Management Section */}
          <section className="card tasks-section">
            <h2>Tasks</h2>
            <div className="task-input">
              <input type="text" placeholder="Add a new task..." />
              <button className="btn btn-primary">Add</button>
            </div>
            <div className="tasks-list">
              <p className="empty-state">No tasks yet. Add your first task above!</p>
            </div>
          </section>

          {/* Schedule Section */}
          <section className="card schedule-section">
            <h2>Today's Schedule</h2>
            <button className="btn no-print" style={{marginBottom: '1rem'}}>
              Print Schedule
            </button>
            <div className="schedule-grid">
              <p className="empty-state">Your schedule will appear here</p>
            </div>
          </section>

          {/* Quick Notes Section */}
          <section className="card notes-section">
            <h2>Quick Notes</h2>
            <textarea
              placeholder="Jot down quick thoughts, ideas, or reminders..."
              rows="6"
            />
          </section>

          {/* Habit Tracker Section */}
          <section className="card habits-section">
            <h2>Daily Habits</h2>
            <div className="habits-list">
              <p className="empty-state">Add habits to track your daily routines</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
