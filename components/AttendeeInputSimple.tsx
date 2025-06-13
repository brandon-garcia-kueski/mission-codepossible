'use client'

import { useState, useRef } from 'react'

export interface Contact {
  id: string
  name: string
  email: string
  photo?: string | null
}

interface AttendeeInputProps {
  attendees: Contact[]
  onAttendeesChange: (attendees: Contact[]) => void
  placeholder?: string
}

export default function AttendeeInput({ attendees, onAttendeesChange, placeholder }: AttendeeInputProps) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim() && isValidEmail(inputValue.trim())) {
        addContact(inputValue.trim())
      }
    }
  }

  const addContact = (email: string) => {
    if (!attendees.some(a => a.email === email)) {
      const newContact: Contact = {
        id: `contact-${Date.now()}`,
        name: email.split('@')[0],
        email: email
      }
      const newAttendees = [...attendees, newContact]
      onAttendeesChange(newAttendees)
      setInputValue('')
      inputRef.current?.focus()
    }
  }

  const removeAttendee = (emailToRemove: string) => {
    const newAttendees = attendees.filter(attendee => attendee.email !== emailToRemove)
    onAttendeesChange(newAttendees)
  }

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleAddClick = () => {
    if (inputValue.trim() && isValidEmail(inputValue.trim())) {
      addContact(inputValue.trim())
    }
  }

  return (
    <div className="relative">
      {/* Lista de asistentes seleccionados */}
      {attendees.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attendees.map((attendee) => (
            <div
              key={attendee.email}
              className="flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
            >
              <span className="mr-2">
                {attendee.name} ({attendee.email})
              </span>
              <button
                type="button"
                onClick={() => removeAttendee(attendee.email)}
                className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 font-semibold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input de email */}
      <div className="relative flex">
        <input
          ref={inputRef}
          type="email"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Escribe un email y presiona Enter..."}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
        <button
          type="button"
          onClick={handleAddClick}
          disabled={!inputValue.trim() || !isValidEmail(inputValue.trim())}
          className="px-4 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Agregar
        </button>
      </div>

      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Escribe emails válidos y presiona Enter o el botón Agregar
      </p>
      
      {inputValue && !isValidEmail(inputValue) && (
        <p className="mt-1 text-sm text-red-500">
          Por favor, ingresa un email válido
        </p>
      )}
    </div>
  )
}
