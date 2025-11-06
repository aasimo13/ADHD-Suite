import { useMemo, useState } from 'react'
import { useDashboard } from '../context/DashboardContext'

const hours = Array.from({ length: 16 }, (_, index) => 6 + index) // 6am - 21h

const SchedulePlanner = () => {
  const { state, dispatch } = useDashboard()
  const [planForm, setPlanForm] = useState({
    title: '',
    start: '09:00',
    end: '10:00',
    taskId: ''
  })

  const sortedBlocks = useMemo(() => {
    return [...state.scheduleBlocks].sort((a, b) => a.start.localeCompare(b.start))
  }, [state.scheduleBlocks])

  const conflicts = useMemo(() => {
    const result = new Set()
    sortedBlocks.forEach((block, index) => {
      const blockStart = block.start
      const blockEnd = block.end
      for (let pointer = 0; pointer < sortedBlocks.length; pointer += 1) {
        if (pointer === index) continue
        const compare = sortedBlocks[pointer]
        if (blockStart < compare.end && blockEnd > compare.start) {
          result.add(block.id)
          result.add(compare.id)
        }
      }
    })
    return result
  }, [sortedBlocks])

  const handleInput = (key, value) => {
    setPlanForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleAddBlock = (event) => {
    event.preventDefault()
    if (!planForm.title.trim()) return
    if (planForm.start >= planForm.end) return

    const block = {
      id: `block-${Date.now()}`,
      title: planForm.title.trim(),
      start: planForm.start,
      end: planForm.end,
      taskId: planForm.taskId || null,
      createdAt: Date.now()
    }

    dispatch({ type: 'ADD_SCHEDULE_BLOCK', payload: block })
    const nextStart = planForm.end
    const nextEnd = addMinutes(planForm.end, 30)
    setPlanForm({ title: '', start: nextStart, end: nextEnd, taskId: '' })
  }

  const removeBlock = (blockId) => {
    dispatch({ type: 'REMOVE_SCHEDULE_BLOCK', payload: blockId })
  }

  return (
    <section className="card schedule-section">
      <div className="section-header">
        <h2>Adaptive Schedule</h2>
        <p className="section-subtitle">Time block your day with buffers and task links</p>
      </div>

      <form className="schedule-form" onSubmit={handleAddBlock}>
        <input
          type="text"
          placeholder="Label this block (e.g. Deep work, Lunch)"
          value={planForm.title}
          onChange={(event) => handleInput('title', event.target.value)}
        />
        <div className="time-pickers">
          <label>
            Start
            <input type="time" value={planForm.start} onChange={(event) => handleInput('start', event.target.value)} />
          </label>
          <label>
            End
            <input type="time" value={planForm.end} onChange={(event) => handleInput('end', event.target.value)} />
          </label>
        </div>
        <label>
          Link task (optional)
          <select value={planForm.taskId} onChange={(event) => handleInput('taskId', event.target.value)}>
            <option value="">-- none --</option>
            {state.tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn-primary">
          Add block
        </button>
      </form>

      <div className="schedule-grid">
        <aside className="schedule-hours">
          {hours.map((hour) => (
            <div key={hour} className="hour-label">
              {formatHourLabel(hour)}
            </div>
          ))}
        </aside>
        <div className="schedule-blocks">
          {sortedBlocks.length === 0 && <p className="empty-state">Your schedule will appear here</p>}
          {sortedBlocks.map((block) => (
            <div
              key={block.id}
              className={`schedule-block ${conflicts.has(block.id) ? 'conflict' : ''}`}
              style={blockStyle(block.start, block.end)}
            >
              <header>
                <strong>{block.title}</strong>
                <span>{formatRange(block.start, block.end)}</span>
              </header>
              {block.taskId && (
                <p className="linked-task">
                  Linked task: <span>{state.tasks.find((task) => task.id === block.taskId)?.title || 'Removed'}</span>
                </p>
              )}
              <button type="button" className="btn small no-print" onClick={() => removeBlock(block.id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const blockStyle = (start, end) => {
  const startParts = start.split(':').map(Number)
  const endParts = end.split(':').map(Number)
  const startMinutes = startParts[0] * 60 + startParts[1]
  const endMinutes = endParts[0] * 60 + endParts[1]
  const baseMinutes = 6 * 60
  const totalMinutes = 16 * 60
  const top = ((startMinutes - baseMinutes) / totalMinutes) * 100
  const height = ((endMinutes - startMinutes) / totalMinutes) * 100
  return {
    top: `${Math.max(top, 0)}%`,
    height: `${Math.max(height, 5)}%`
  }
}

const formatRange = (start, end) => {
  const toDisplay = (value) => {
    const [hour, minutes] = value.split(':').map(Number)
    const date = new Date()
    date.setHours(hour, minutes, 0, 0)
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }
  return `${toDisplay(start)} - ${toDisplay(end)}`
}

const formatHourLabel = (hour) => {
  const date = new Date()
  date.setHours(hour, 0, 0, 0)
  return date.toLocaleTimeString([], { hour: 'numeric' })
}

const addMinutes = (time, minutesToAdd) => {
  const [hour, minutes] = time.split(':').map(Number)
  const date = new Date()
  date.setHours(hour, minutes + minutesToAdd, 0, 0)
  const newHour = date.getHours().toString().padStart(2, '0')
  const newMinutes = date.getMinutes().toString().padStart(2, '0')
  return `${newHour}:${newMinutes}`
}

export default SchedulePlanner
