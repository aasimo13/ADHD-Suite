import { useMemo, useState } from 'react'
import { useDashboard } from '../context/DashboardContext'

const defaultTask = {
  title: '',
  priority: 'medium',
  energy: 'steady',
  estimate: 25,
  bucket: 'today'
}

const TaskManager = () => {
  const { state, dispatch } = useDashboard()
  const [formState, setFormState] = useState(() => ({ ...defaultTask }))
  const [subtaskDraft, setSubtaskDraft] = useState('')
  const [activeTaskId, setActiveTaskId] = useState(null)
  const [filter, setFilter] = useState('all')

  const tasksByBucket = useMemo(() => {
    const filtered = state.tasks.filter((task) => {
      if (filter === 'focus') return task.priority === 'high'
      if (filter === 'low-energy') return task.energy === 'low'
      if (filter === 'in-progress') return !task.completed
      return true
    })

    return {
      today: filtered.filter((task) => task.bucket === 'today'),
      week: filtered.filter((task) => task.bucket === 'week'),
      backlog: filtered.filter((task) => task.bucket === 'backlog')
    }
  }, [state.tasks, filter])

  const handleInput = (key, value) => {
    setFormState((prev) => ({ ...prev, [key]: value }))
  }

  const handleCreateTask = (event) => {
    event.preventDefault()
    if (!formState.title.trim()) return

    const task = {
      id: `task-${Date.now()}`,
      title: formState.title.trim(),
      priority: formState.priority,
      energy: formState.energy,
      estimate: Number(formState.estimate) || 25,
      bucket: formState.bucket,
      completed: false,
      subtasks: [],
      createdAt: Date.now()
    }

    dispatch({ type: 'ADD_TASK', payload: task })
    setFormState({ ...defaultTask })
  }

  const toggleTask = (taskId) => {
    const task = state.tasks.find((item) => item.id === taskId)
    if (!task) return
    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        id: taskId,
        updates: { completed: !task.completed }
      }
    })
  }

  const handleBucketChange = (taskId, bucket) => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: { id: taskId, updates: { bucket } }
    })
  }

  const handleAddSubtask = (taskId) => {
    if (!subtaskDraft.trim()) return
    const task = state.tasks.find((item) => item.id === taskId)
    if (!task) return
    const updatedSubtasks = [
      ...task.subtasks,
      {
        id: `subtask-${Date.now()}`,
        text: subtaskDraft.trim(),
        completed: false
      }
    ]
    dispatch({
      type: 'UPDATE_TASK',
      payload: { id: taskId, updates: { subtasks: updatedSubtasks } }
    })
    setSubtaskDraft('')
    setActiveTaskId(taskId)
  }

  const toggleSubtask = (taskId, subtaskId) => {
    const task = state.tasks.find((item) => item.id === taskId)
    if (!task) return
    const updatedSubtasks = task.subtasks.map((subtask) =>
      subtask.id === subtaskId
        ? { ...subtask, completed: !subtask.completed }
        : subtask
    )
    dispatch({
      type: 'UPDATE_TASK',
      payload: { id: taskId, updates: { subtasks: updatedSubtasks } }
    })
  }

  return (
    <section className="card tasks-section">
      <div className="section-header">
        <h2>Task Breakdown Lab</h2>
        <div className="filter-group">
          <button type="button" className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All
          </button>
          <button type="button" className={`chip ${filter === 'focus' ? 'active' : ''}`} onClick={() => setFilter('focus')}>
            Deep focus
          </button>
          <button
            type="button"
            className={`chip ${filter === 'low-energy' ? 'active' : ''}`}
            onClick={() => setFilter('low-energy')}
          >
            Low energy
          </button>
          <button
            type="button"
            className={`chip ${filter === 'in-progress' ? 'active' : ''}`}
            onClick={() => setFilter('in-progress')}
          >
            In progress
          </button>
        </div>
      </div>

      <form className="task-input" onSubmit={handleCreateTask}>
        <input
          type="text"
          placeholder="Capture a task..."
          value={formState.title}
          onChange={(event) => handleInput('title', event.target.value)}
        />
        <select value={formState.priority} onChange={(event) => handleInput('priority', event.target.value)}>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={formState.energy} onChange={(event) => handleInput('energy', event.target.value)}>
          <option value="steady">Steady</option>
          <option value="high">High</option>
          <option value="low">Low</option>
        </select>
        <select value={formState.bucket} onChange={(event) => handleInput('bucket', event.target.value)}>
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="backlog">Backlog</option>
        </select>
        <input
          type="number"
          min="5"
          step="5"
          value={formState.estimate}
          onChange={(event) => handleInput('estimate', event.target.value)}
          title="Estimated minutes"
        />
        <button type="submit" className="btn btn-primary">
          Add
        </button>
      </form>

      <div className="task-columns">
        {Object.entries(tasksByBucket).map(([bucket, tasks]) => (
          <div key={bucket} className="task-column">
            <header>
              <h3>{columnTitle[bucket]}</h3>
              <span className="count">{tasks.length}</span>
            </header>
            <div className="column-body">
              {tasks.length === 0 ? (
                <p className="empty-state">No tasks here yet. Drop something in!</p>
              ) : (
                tasks.map((task) => (
                  <article key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
                    <div className="task-card-header">
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(task.id)}
                        />
                        <span>{task.title}</span>
                      </label>
                      <div className="task-tags">
                        <span className={`tag priority ${task.priority}`}>{task.priority}</span>
                        <span className={`tag energy ${task.energy}`}>{task.energy} energy</span>
                        <span className="tag estimate">{task.estimate}m</span>
                      </div>
                    </div>

                    {task.subtasks.length > 0 && (
                      <ul className="subtasks">
                        {task.subtasks.map((subtask) => (
                          <li key={subtask.id}>
                            <label className="checkbox">
                              <input
                                type="checkbox"
                                checked={subtask.completed}
                                onChange={() => toggleSubtask(task.id, subtask.id)}
                              />
                              <span>{subtask.text}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="task-actions">
                      <select value={task.bucket} onChange={(event) => handleBucketChange(task.id, event.target.value)}>
                        <option value="today">Today</option>
                        <option value="week">This week</option>
                        <option value="backlog">Backlog</option>
                      </select>
                      <button
                        type="button"
                        className="btn small"
                        onClick={() => setActiveTaskId(activeTaskId === task.id ? null : task.id)}
                      >
                        Breakdown
                      </button>
                    </div>

                    {activeTaskId === task.id && (
                      <div className="subtask-creator">
                        <input
                          type="text"
                          placeholder="Add a sub-step"
                          value={subtaskDraft}
                          onChange={(event) => setSubtaskDraft(event.target.value)}
                        />
                        <button type="button" className="btn" onClick={() => handleAddSubtask(task.id)}>
                          Add
                        </button>
                      </div>
                    )}
                  </article>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

const columnTitle = {
  today: 'Today\'s Power Moves',
  week: 'This Week',
  backlog: 'Backlog / Someday'
}

export default TaskManager
