import { useEffect, useState } from 'react'
import { useDashboard } from '../context/DashboardContext'

const NotesPanel = () => {
  const { state, dispatch } = useDashboard()
  const [noteDraft, setNoteDraft] = useState('')

  useEffect(() => {
    setNoteDraft(state.notes)
  }, [state.notes])

  const handleSaveNotes = (value) => {
    dispatch({ type: 'SET_NOTES', payload: value })
  }

  const handlePin = () => {
    const snippet = noteDraft.trim() || state.notes.trim()
    if (!snippet) return
    dispatch({ type: 'PIN_NOTE', payload: snippet.slice(0, 140) })
    setNoteDraft('')
  }

  const handleRemovePin = (pin) => {
    dispatch({ type: 'UNPIN_NOTE', payload: pin })
  }

  return (
    <section className="card notes-section">
      <div className="section-header">
        <h2>Quick Notes</h2>
        <p className="section-subtitle">Capture sparks and pin what matters</p>
      </div>
      <textarea
        value={noteDraft}
        onChange={(event) => {
          setNoteDraft(event.target.value)
          handleSaveNotes(event.target.value)
        }}
        rows={6}
        placeholder="Jot down ideas, reminders, or wins..."
      />
      <div className="notes-actions">
        <button type="button" className="btn" onClick={() => handleSaveNotes(noteDraft)}>
          Save note
        </button>
        <button type="button" className="btn btn-primary" onClick={handlePin}>
          Pin current thought
        </button>
      </div>
      {state.pinnedNotes.length > 0 && (
        <div className="pinned-notes">
          <h3>Pinned highlights</h3>
          <ul>
            {state.pinnedNotes.map((pin) => (
              <li key={pin}>
                <span>{pin}</span>
                <button type="button" className="btn small" onClick={() => handleRemovePin(pin)}>
                  Unpin
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export default NotesPanel
