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

    // If there's a search query, filter Pokemon
    if (searchId.trim()) {
      setSearchLoading(true)
      try {
        // Search using PokeAPI
        const searchResults = await searchPokemonByName(searchId.trim().toLowerCase())
        
        if (searchResults.length > 0) {
          // Limit to max 80 results (10x8 grid)
          const limitedResults = searchResults.slice(0, 80)
          setRandomPokemon(limitedResults)
        } else {
          // No results, load random grid
          await loadRandomPokemon()
        }
        setShowRandomGrid(true)
      } catch (error) {
        console.error('Search error:', error)
        // On error, show random grid
        await loadRandomPokemon()
        setShowRandomGrid(true)
      } finally {
        setSearchLoading(false)
      }
    } else {
      // No search query, load random grid
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
  }

  const searchPokemonByName = async (query) => {
    try {
      const totalPokemon = 1010
      const results = []
      
      // Fetch all pokemon names from PokeAPI (species list)
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${totalPokemon}`)
      const data = await response.json()
      
      // Filter by name matching the query
      const matchingPokemon = data.results.filter(p => 
        p.name.toLowerCase().includes(query)
      )
      
      // Fetch details for matching Pokemon (limit to 64)
      const limitedMatches = matchingPokemon.slice(0, 64)
      const pokemonPromises = limitedMatches.map(async (p) => {
        try {
          const pokemonData = await pokemonService.fetchPokemonFromAPI(p.name)
          return { ...pokemonData, pokemon_id: pokemonData.id, id: pokemonData.id }
        } catch (error) {
          return null
        }
      })
      
      const fetchedResults = await Promise.all(pokemonPromises)
      return fetchedResults.filter(p => p !== null)
    } catch (error) {
      console.error('Error searching Pokemon:', error)
      return []
    }
  }

  const loadRandomPokemon = async () => {
    const totalPokemon = 1010 // Total number of Pokemon in PokeAPI
    const gridSize = 64 // 8 columns x 8 rows
    const randomIds = []
    
    // Generate 64 random unique Pokemon IDs
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
      console.log('[PokemonSelector] Adding Pokemon to crew:', selectedPopupPokemon)
      
      // Check if Pokemon already exists in database
      const existingPokemon = pokemon.find(p => p.pokemon_id === selectedPopupPokemon.id)
      
      if (existingPokemon) {
        console.log('[PokemonSelector] Pokemon already exists, using existing:', existingPokemon)
        onSelect(existingPokemon)
      } else {
        console.log('[PokemonSelector] Pokemon not in database, adding new Pokemon')
        const newPokemon = await pokemonService.addPokemon(selectedPopupPokemon)
        console.log('[PokemonSelector] Pokemon added to database:', newPokemon)
        
        // Refresh the pokemon list
        await loadPokemon()
        
        onSelect(newPokemon)
      }
      
      setSelectedPopupPokemon(null)
    } catch (error) {
      console.error('[PokemonSelector] Error adding Pokemon to crew:', error)
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
              placeholder="Search to browse"
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
            <span className="grid-info">
              {searchId.trim() 
                ? `Showing ${randomPokemon.length} result${randomPokemon.length !== 1 ? 's' : ''} for "${searchId}"`
                : `Click any Pokemon for details (${randomPokemon.length} shown)`
              }
            </span>
          </div>
        )}

        {!showRandomGrid && (
          <div className="filter-section">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="🔍 Filter Pokemon by name"
              className="filter-input"
            />
            <span className="pokemon-count">
              Recommendations
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
