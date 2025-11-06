import { useState } from 'react'
import { useDashboard, getTodayKey } from '../context/DashboardContext'
import '../styles/print-schedule.css'

const PrintSchedule = () => {
  const { state } = useDashboard()
  const [isOpen, setIsOpen] = useState(false)
  const today = getTodayKey()

  // Get today's data
  const todaysTasks = state.tasks
    .filter(t => t.bucket === 'today')
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

  const todaysBlocks = state.scheduleBlocks
    .sort((a, b) => a.start.localeCompare(b.start))

  const todaysHabits = state.habits || []
  const todaysNotes = state.notes?.[today] || []
  const pinnedNotes = state.pinnedNotes || []

  // Calculate total scheduled time
  const totalScheduledMinutes = todaysBlocks.reduce((total, block) => {
    const [startHour, startMin] = block.start.split(':').map(Number)
    const [endHour, endMin] = block.end.split(':').map(Number)
    const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin)
    return total + duration
  }, 0)

  const totalTaskMinutes = todaysTasks.reduce((total, task) => total + (task.estimate || 0), 0)

  const formatTime = (timeString) => {
    const [hour, minutes] = timeString.split(':').map(Number)
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  const handlePrint = () => {
    window.print()
  }

  if (!isOpen) {
    return (
      <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
        📄 Print Schedule
      </button>
    )
  }

  return (
    <>
      <div className="print-schedule-overlay" onClick={() => setIsOpen(false)}>
        <div className="print-schedule-modal" onClick={(e) => e.stopPropagation()}>
          <div className="no-print modal-actions">
            <h2>Print Your ADHD-Optimized Schedule</h2>
            <div className="action-buttons">
              <button className="btn btn-primary" onClick={handlePrint}>
                🖨️ Print Schedule
              </button>
              <button className="btn" onClick={() => setIsOpen(false)}>
                Close
              </button>
            </div>
          </div>

          <div className="printable-content">
            {/* Header Section */}
            <div className="print-header">
              <div className="print-title">
                <h1>Daily Focus Schedule</h1>
                <p className="print-date">{new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>

              <div className="print-summary">
                <div className="summary-item">
                  <strong>Tasks:</strong> {todaysTasks.length}
                </div>
                <div className="summary-item">
                  <strong>Scheduled:</strong> {Math.floor(totalScheduledMinutes / 60)}h {totalScheduledMinutes % 60}m
                </div>
                <div className="summary-item">
                  <strong>Estimated:</strong> {Math.floor(totalTaskMinutes / 60)}h {totalTaskMinutes % 60}m
                </div>
              </div>
            </div>

            {/* ADHD Tips Box */}
            <div className="adhd-tips-box">
              <strong>💡 ADHD Tips:</strong> Start with high-priority tasks during your peak energy.
              Take 5-minute breaks every 25-30 minutes. Cross off tasks as you complete them for dopamine boost!
            </div>

            {/* Time Blocks Section */}
            {todaysBlocks.length > 0 && (
              <div className="print-section schedule-blocks-section">
                <h2 className="section-title">⏰ Time Blocks</h2>
                <div className="schedule-timeline">
                  {todaysBlocks.map((block, index) => {
                    const linkedTask = block.taskId
                      ? state.tasks.find(t => t.id === block.taskId)
                      : null
                    const nextBlock = todaysBlocks[index + 1]
                    const hasBuffer = nextBlock && block.end !== nextBlock.start

                    return (
                      <div key={block.id}>
                        <div className={`schedule-block ${linkedTask?.priority || ''}`}>
                          <div className="block-time">
                            <strong>{formatTime(block.start)}</strong>
                            <span className="time-separator">→</span>
                            <strong>{formatTime(block.end)}</strong>
                          </div>
                          <div className="block-content">
                            <div className="block-title">{block.title}</div>
                            {linkedTask && (
                              <div className="block-tags">
                                <span className={`tag priority ${linkedTask.priority}`}>
                                  {linkedTask.priority}
                                </span>
                                <span className={`tag energy ${linkedTask.energy}`}>
                                  {linkedTask.energy} energy
                                </span>
                                {linkedTask.estimate && (
                                  <span className="tag estimate">{linkedTask.estimate}m</span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="block-checkbox">
                            <input type="checkbox" />
                          </div>
                        </div>
                        {hasBuffer && (
                          <div className="buffer-time">
                            ⏸️ Break/Buffer Time
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Priority Tasks Section */}
            {todaysTasks.length > 0 && (
              <div className="print-section tasks-section">
                <h2 className="section-title">✓ Today's Tasks</h2>
                <div className="tasks-grid">
                  {todaysTasks.map(task => (
                    <div key={task.id} className={`task-item ${task.priority}`}>
                      <div className="task-header">
                        <input type="checkbox" className="task-checkbox" />
                        <div className="task-title">{task.title}</div>
                      </div>
                      <div className="task-meta">
                        <span className={`tag priority ${task.priority}`}>{task.priority}</span>
                        <span className={`tag energy ${task.energy}`}>{task.energy}</span>
                        {task.estimate && (
                          <span className="tag estimate">{task.estimate}m</span>
                        )}
                      </div>
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="subtasks-list">
                          {task.subtasks.map(subtask => (
                            <div key={subtask.id} className="subtask-item">
                              <input type="checkbox" />
                              <span>{subtask.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Habits Section */}
            {todaysHabits.length > 0 && (
              <div className="print-section habits-section">
                <h2 className="section-title">🔄 Daily Habits</h2>
                <div className="habits-checklist">
                  {todaysHabits.map(habit => (
                    <div key={habit.id} className="habit-item">
                      <input type="checkbox" />
                      <span>{habit.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pinned Notes Section */}
            {pinnedNotes.length > 0 && (
              <div className="print-section notes-section">
                <h2 className="section-title">📌 Important Notes</h2>
                <div className="notes-list">
                  {pinnedNotes.map((noteId, index) => {
                    const note = todaysNotes.find(n => n.id === noteId)
                    return note ? (
                      <div key={noteId} className="note-item">
                        • {note.text}
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            )}

            {/* Blank Notes Section */}
            <div className="print-section blank-notes-section">
              <h2 className="section-title">📝 Quick Notes & Reflections</h2>
              <div className="blank-lines">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="blank-line"></div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="print-footer">
              <p>Remember: Progress over perfection! You've got this! 💪</p>
              <p className="print-attribution">Generated by ADHD Suite • {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PrintSchedule
