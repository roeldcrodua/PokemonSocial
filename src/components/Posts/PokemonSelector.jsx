import { useState, useEffect } from 'react'
import { pokemonService } from '../../services/pokemonService'
import PokemonCard from '../Pokemon/PokemonCard'
import PokemonPopup from '../Pokemon/PokemonPopup'

export default function PokemonSelector({ onSelect, onClose }) {
  const [pokemon, setPokemon] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchId, setSearchId] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [filter, setFilter] = useState('')
  const [randomPokemon, setRandomPokemon] = useState([])
  const [showRandomGrid, setShowRandomGrid] = useState(false)
  const [selectedPopupPokemon, setSelectedPopupPokemon] = useState(null)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const [selectedFields, setSelectedFields] = useState({
    artwork: true,
    frontGif: false,
    backGif: false,
    id: true,
    name: true,
    types: true,
    abilities: false
  })

  useEffect(() => {
    loadPokemon()
  }, [])

  const loadPokemon = async () => {
    try {
      const data = await pokemonService.getAllPokemon()
      setPokemon(data)
    } catch (error) {
      console.error('Error loading pokemon:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchId.trim()) return

    // If searching, show random grid
    setSearchLoading(true)
    try {
      await loadRandomPokemon()
      setShowRandomGrid(true)
    } catch (error) {
      alert('Failed to load Pokemon grid')
    } finally {
      setSearchLoading(false)
    }
  }

  const loadRandomPokemon = async () => {
    const totalPokemon = 1010 // Total number of Pokemon in PokeAPI
    const gridSize = 80 // 10 columns x 8 rows
    const randomIds = []
    
    // Generate 80 random unique Pokemon IDs
    while (randomIds.length < gridSize) {
      const randomId = Math.floor(Math.random() * totalPokemon) + 1
      if (!randomIds.includes(randomId)) {
        randomIds.push(randomId)
      }
    }

    // Fetch Pokemon data for all random IDs
    const pokemonPromises = randomIds.map(async (id) => {
      try {
        const data = await pokemonService.fetchPokemonFromAPI(id)
        return { ...data, pokemon_id: id, id: id }
      } catch (error) {
        return null
      }
    })

    const results = await Promise.all(pokemonPromises)
    const validPokemon = results.filter(p => p !== null)
    setRandomPokemon(validPokemon)
  }

  const handlePokemonCardClick = (pokemon, event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setPopupPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    })
    setSelectedPopupPokemon(pokemon)
  }

  const handleFieldToggle = (field) => {
    setSelectedFields(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleAddToCrew = async () => {
    if (!selectedPopupPokemon) return
    
    try {
      // Add to database if not exists
      const existingPokemon = pokemon.find(p => p.pokemon_id === selectedPopupPokemon.id)
      const pokemonToSelect = existingPokemon || await pokemonService.addPokemon(selectedPopupPokemon)
      
      onSelect(pokemonToSelect)
      setSelectedPopupPokemon(null)
    } catch (error) {
      // Pokemon might already exist, try to select it anyway
      onSelect(selectedPopupPokemon)
      setSelectedPopupPokemon(null)
    }
  }

  const handleClosePopup = () => {
    setSelectedPopupPokemon(null)
  }

  const handleBackToList = () => {
    setShowRandomGrid(false)
    setRandomPokemon([])
    setSearchId('')
  }

  const filteredPokemon = filter
    ? pokemon.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
    : pokemon

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content pokemon-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2>🎮 Choose Your Pokemon Hero</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {!showRandomGrid && (
          <form onSubmit={handleSearch} className="pokemon-search-form">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Search to browse 80 random Pokemon..."
              className="search-input"
            />
            <button type="submit" disabled={searchLoading} className="add-button">
              {searchLoading ? '⏳ Loading Grid...' : '🔍 Browse Pokemon'}
            </button>
          </form>
        )}

        {showRandomGrid && (
          <div className="grid-header">
            <button onClick={handleBackToList} className="back-button">
              ← Back to Saved Pokemon
            </button>
            <span className="grid-info">10 × 8 Grid - Click any Pokemon for details</span>
          </div>
        )}

        {!showRandomGrid && (
          <div className="filter-section">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="🔍 Filter saved Pokemon by name..."
              className="filter-input"
            />
            <span className="pokemon-count">
              {filteredPokemon.length} Pokemon{filteredPokemon.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {showRandomGrid ? (
          searchLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading 80 Random Pokemon...</p>
            </div>
          ) : (
            <div className="pokemon-random-grid">
              {randomPokemon.map((p, index) => (
                <PokemonCard
                  key={index}
                  pokemon={p}
                  onClick={(event) => handlePokemonCardClick(p, event)}
                />
              ))}
            </div>
          )
        ) : loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading Pokemon...</p>
          </div>
        ) : (
          <div className="pokemon-grid-popup">
            {filteredPokemon.length === 0 ? (
              <div className="no-results">
                <p>No Pokemon found matching "{filter}"</p>
              </div>
            ) : (
              filteredPokemon.map((p) => (
                <div
                  key={p.pokemon_id}
                  className="pokemon-card-selector"
                  onClick={() => onSelect(p)}
                >
                  <div className="pokemon-id-badge">#{p.pokemon_id}</div>
                  <div className="pokemon-image-wrapper">
                    <img src={p.imageUrl || p.smallUrl} alt={p.name} />
                  </div>
                  <div className="pokemon-info">
                    <h3 className="pokemon-card-name">{p.name}</h3>
                    <div className="pokemon-card-types">
                      {p.types?.map((type, i) => (
                        <span key={i} className={`type-tag type-${type.toLowerCase()}`}>
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button className="select-btn">Select</button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {selectedPopupPokemon && (
        <PokemonPopup
          pokemon={selectedPopupPokemon}
          position={popupPosition}
          selectedFields={selectedFields}
          onFieldToggle={handleFieldToggle}
          onAddToCrew={handleAddToCrew}
          onClose={handleClosePopup}
        />
      )}
    </div>
  )
}
