'use client'

import { useState, useEffect, useRef } from 'react'
import { useGoogleContacts, Contact } from '@/hooks/useGoogleContacts'
import ContactAvatar from './ContactAvatar'

interface AttendeeInputProps {
  attendees: Contact[]
  onAttendeesChange: (attendees: Contact[]) => void
  placeholder?: string
}

export default function AttendeeInput({ attendees, onAttendeesChange, placeholder }: AttendeeInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<Contact[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const { searchContacts, loading } = useGoogleContacts()
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const searchForContacts = async () => {
      if (inputValue.trim().length > 0) {
        try {
          const contacts = await searchContacts(inputValue)
          // Filtrar contactos que ya están seleccionados
          const filteredContacts = contacts.filter(
            contact => !attendees.some(attendee => attendee.email === contact.email)
          )
          setSuggestions(filteredContacts)
          setShowSuggestions(true)
          setSelectedIndex(-1)
        } catch (error) {
          console.error('Error searching contacts:', error)
          // Si falla la API de contactos, simplemente no mostramos sugerencias
          setSuggestions([])
          setShowSuggestions(false)
        }
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }

    const debounceTimer = setTimeout(searchForContacts, 300)
    return () => clearTimeout(debounceTimer)
  }, [inputValue, searchContacts, attendees])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        selectContact(suggestions[selectedIndex])
      } else if (inputValue.trim() && isValidEmail(inputValue.trim())) {
        // Si es un email válido, agregarlo como contacto manual
        addManualContact()
      }
      return
    }

    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const selectContact = (contact: Contact) => {
    const newAttendees = [...attendees, contact]
    onAttendeesChange(newAttendees)
    setInputValue('')
    setShowSuggestions(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  const addManualContact = () => {
    const email = inputValue.trim()
    if (email && email.includes('@') && !attendees.some(a => a.email === email)) {
      const manualContact: Contact = {
        id: `manual-${Date.now()}`,
        name: email.split('@')[0],
        email: email
      }
      selectContact(manualContact)
    }
  }

  const removeAttendee = (emailToRemove: string) => {
    const newAttendees = attendees.filter(attendee => attendee.email !== emailToRemove)
    onAttendeesChange(newAttendees)
  }

  const handleInputBlur = () => {
    // Usar setTimeout para permitir que el click en sugerencias funcione
    setTimeout(() => {
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }, 150)
  }

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
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
              {attendee.photo && (
                <img
                  src={attendee.photo}
                  alt={attendee.name}
                  className="w-5 h-5 rounded-full mr-2"
                />
              )}
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

      {/* Input de búsqueda */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          onFocus={() => inputValue && setShowSuggestions(true)}
          placeholder={placeholder || "Buscar contactos o escribir email..."}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
        
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Lista de sugerencias */}
        {showSuggestions && suggestions.length > 0 && (
          <ul
            ref={suggestionsRef}
            className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((contact, index) => (
              <li key={contact.id}>
                <button
                  type="button"
                  onClick={() => selectContact(contact)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center ${
                    index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <ContactAvatar
                    src={contact.photo}
                    alt={contact.name}
                    size={32}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {contact.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {contact.email}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Sugerencia para email manual */}
        {showSuggestions && suggestions.length === 0 && inputValue && isValidEmail(inputValue) && (
          <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
            <li>
              <button
                type="button"
                onClick={addManualContact}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full mr-3 flex items-center justify-center">
                  <span className="text-gray-600 dark:text-gray-300 text-sm">@</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Agregar "{inputValue}"
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Presiona Enter para agregar este email
                  </div>
                </div>
              </button>
            </li>
          </ul>
        )}
      </div>

      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Busca contactos de Google o escribe emails separados por Enter
      </p>
    </div>
  )
}
