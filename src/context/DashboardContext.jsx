import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

const defaultPrompts = [
  {
    id: 'priorities',
    text: 'What are my top 3 priorities for today?'
  },
  {
    id: 'success',
    text: 'What would make today feel successful?'
  },
  {
    id: 'must-do',
    text: "What\'s the one thing I absolutely need to accomplish?"
  },
  {
    id: 'distractions',
    text: 'What potential distractions should I be aware of?'
  },
  {
    id: 'check-in',
    text: 'How am I feeling right now, and what do I need?'
  }
]

const defaultHabits = [
  { id: 'hydrate', name: 'Drink water', streak: 0 },
  { id: 'movement', name: 'Take a movement break', streak: 0 },
  { id: 'plan', name: 'Review plan at midday', streak: 0 }
]

export const getTodayKey = () => new Date().toLocaleDateString('en-CA')

const initialState = {
  prompts: defaultPrompts,
  promptResponses: {},
  moodCheckins: {},
  tasks: [],
  taskFilter: 'all',
  notes: '',
  pinnedNotes: [],
  habits: defaultHabits,
  habitLog: {},
  scheduleBlocks: [],
  timerSettings: {
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4
  },
  timerState: {
    mode: 'focus',
    isRunning: false,
    secondsRemaining: 25 * 60,
    sessionCount: 0,
    completedSessions: []
  }
}

const storageKey = 'adhd-suite-dashboard'

const DashboardContext = createContext()

const hydrateState = () => {
  if (typeof window === 'undefined') return initialState
  try {
    const stored = window.localStorage.getItem(storageKey)
    if (!stored) return initialState
    const parsed = JSON.parse(stored)
    return {
      ...initialState,
      ...parsed,
      timerState: {
        ...initialState.timerState,
        ...(parsed?.timerState || {}),
        isRunning: false
      }
    }
  } catch (error) {
    console.error('Failed to parse stored dashboard state', error)
    return initialState
  }
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_PROMPT_RESPONSE': {
      const { date, promptId, value } = action.payload
      return {
        ...state,
        promptResponses: {
          ...state.promptResponses,
          [date]: {
            ...(state.promptResponses[date] || {}),
            [promptId]: value
          }
        }
      }
    }
    case 'SET_MOOD': {
      const { date, mood } = action.payload
      return {
        ...state,
        moodCheckins: {
          ...state.moodCheckins,
          [date]: mood
        }
      }
    }
    case 'ADD_PROMPT': {
      return {
        ...state,
        prompts: [...state.prompts, action.payload]
      }
    }
    case 'REMOVE_PROMPT': {
      return {
        ...state,
        prompts: state.prompts.filter((prompt) => prompt.id !== action.payload)
      }
    }
    case 'ADD_TASK': {
      return {
        ...state,
        tasks: [...state.tasks, action.payload]
      }
    }
    case 'UPDATE_TASK': {
      const { id, updates } = action.payload
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === id
            ? { ...task, ...updates }
            : task
        )
      }
    }
    case 'DELETE_TASK': {
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload)
      }
    }
    case 'SET_TASK_FILTER': {
      return {
        ...state,
        taskFilter: action.payload
      }
    }
    case 'SET_NOTES': {
      return {
        ...state,
        notes: action.payload
      }
    }
    case 'PIN_NOTE': {
      return {
        ...state,
        pinnedNotes: Array.from(new Set([action.payload, ...state.pinnedNotes])).slice(0, 5)
      }
    }
    case 'UNPIN_NOTE': {
      return {
        ...state,
        pinnedNotes: state.pinnedNotes.filter((note) => note !== action.payload)
      }
    }
    case 'TOGGLE_HABIT': {
      const { date, habitId } = action.payload
      const dayLog = state.habitLog[date] || {}
      const isComplete = dayLog[habitId]
      const updatedLog = {
        ...state.habitLog,
        [date]: {
          ...dayLog,
          [habitId]: !isComplete
        }
      }

      const updatedHabits = state.habits.map((habit) => {
        if (habit.id !== habitId) return habit
        const streak = !isComplete ? (habit.streak || 0) + 1 : Math.max((habit.streak || 1) - 1, 0)
        return {
          ...habit,
          streak
        }
      })

      return {
        ...state,
        habitLog: updatedLog,
        habits: updatedHabits
      }
    }
    case 'ADD_HABIT': {
      return {
        ...state,
        habits: [...state.habits, action.payload]
      }
    }
    case 'REMOVE_HABIT': {
      return {
        ...state,
        habits: state.habits.filter((habit) => habit.id !== action.payload)
      }
    }
    case 'ADD_SCHEDULE_BLOCK': {
      return {
        ...state,
        scheduleBlocks: [...state.scheduleBlocks, action.payload]
      }
    }
    case 'UPDATE_SCHEDULE_BLOCK': {
      const { id, updates } = action.payload
      return {
        ...state,
        scheduleBlocks: state.scheduleBlocks.map((block) =>
          block.id === id ? { ...block, ...updates } : block
        )
      }
    }
    case 'REMOVE_SCHEDULE_BLOCK': {
      return {
        ...state,
        scheduleBlocks: state.scheduleBlocks.filter((block) => block.id !== action.payload)
      }
    }
    case 'UPDATE_TIMER_SETTINGS': {
      const timerSettings = {
        ...state.timerSettings,
        ...action.payload
      }
      const secondsRemaining =
        state.timerState.mode === 'focus'
          ? timerSettings.focus * 60
          : timerSettings.shortBreak * 60
      return {
        ...state,
        timerSettings,
        timerState: {
          ...state.timerState,
          secondsRemaining,
          isRunning: false
        }
      }
    }
    case 'SET_TIMER_STATE': {
      return {
        ...state,
        timerState: {
          ...state.timerState,
          ...action.payload
        }
      }
    }
    case 'RESET_STATE': {
      return initialState
    }
    default:
      return state
  }
}

export const DashboardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState, hydrateState)

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        ...state,
        timerState: {
          ...state.timerState,
          isRunning: false
        }
      })
    )
  }, [state])

  const value = useMemo(() => ({ state, dispatch }), [state])

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboard = () => {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
