import { supabase } from './supabase'

export const pokemonService = {
  // Get all pokemon
  async getAllPokemon() {
    const { data, error } = await supabase
      .from('pokemon')
      .select('*')
      .order('id', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Get pokemon by ID
  async getPokemonById(pokemonId) {
    const { data, error } = await supabase
      .from('pokemon')
      .select('*')
      .eq('pokemon_id', pokemonId)
      .single()

    if (error) throw error
    return data
  },

  // Add pokemon to database
  async addPokemon(pokemonData) {
    const { data, error } = await supabase
      .from('pokemon')
      .insert(pokemonData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Fetch from PokeAPI
  async fetchPokemonFromAPI(idOrName) {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName}`)
      if (!response.ok) throw new Error('Pokemon not found')
      
      const data = await response.json()
      
      return {
        name: data.name,
        imageUrl: data.sprites.other["home"]?.front_default,
        artwork: data.sprites.other["official-artwork"]?.front_shiny || 
                 data.sprites.other["official-artwork"]?.front_default,
        frontGif: data.sprites.other.showdown?.front_shiny || 
                  data.sprites.other.showdown?.front_default,
        backGif: data.sprites.other.showdown?.back_shiny || 
                 data.sprites.other.showdown?.back_default,
        types: data.types.map(t => t.type.name),
        abilities: data.abilities.map(a => a.ability.name),
        smallUrl: data.sprites.front_default
      }
    } catch (error) {
      console.error('Error fetching pokemon:', error)
      throw error
    }
  }
}
