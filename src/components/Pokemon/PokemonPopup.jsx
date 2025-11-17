import React from 'react';
import './PokemonPopup.css';

const PokemonPopup = ({ pokemon, position, selectedFields, onFieldToggle, onAddToCrew, onClose }) => {
  if (!pokemon) return null;

  return (
    <>
      <div className="popup-overlay" onClick={onClose} />
      <div className="pokemon-popup">
        <button className="popup-close-btn" onClick={onClose}>✕</button>
        <div className="popup-header">
          <h3>#{pokemon.id} - {pokemon.name}</h3>
        </div>
      
      <div className="popup-content">
        <div className="popup-images">
          <div className="image-section">
            <label>
              <input 
                type="checkbox" 
                checked={selectedFields.artwork}
                onChange={() => onFieldToggle('artwork')}
              />
              Artwork
            </label>
            <img src={pokemon.artwork} alt={`${pokemon.name} artwork`} className="artwork-img" />
          </div>
          
          <div className="gif-section">
            <div className="gif-item">
              <label>
                <input 
                  type="checkbox" 
                  checked={selectedFields.frontGif}
                  onChange={() => onFieldToggle('frontGif')}
                />
                Front GIF
              </label>
              <img src={pokemon.frontGif} alt={`${pokemon.name} front`} />
            </div>
            
            <div className="gif-item">
              <label>
                <input 
                  type="checkbox" 
                  checked={selectedFields.backGif}
                  onChange={() => onFieldToggle('backGif')}
                />
                Back GIF
              </label>
              <img src={pokemon.backGif} alt={`${pokemon.name} back`} />
            </div>
          </div>
        </div>

        <div className="popup-details">
          <div className="detail-item">
            <label>
              <input 
                type="checkbox" 
                checked={selectedFields.id}
                onChange={() => onFieldToggle('id')}
              />
              <strong>ID:</strong>
            </label>
            <span>{pokemon.id}</span>
          </div>

          <div className="detail-item">
            <label>
              <input 
                type="checkbox" 
                checked={selectedFields.name}
                onChange={() => onFieldToggle('name')}
              />
              <strong>Name:</strong>
            </label>
            <span>{pokemon.name}</span>
          </div>

          <div className="detail-item">
            <label>
              <input 
                type="checkbox" 
                checked={selectedFields.types}
                onChange={() => onFieldToggle('types')}
              />
              <strong>Types:</strong>
            </label>
            <div className="types-list">
              {pokemon.types.map((type, idx) => (
                <span key={idx} className={`type-badge type-${type}`}>
                  {type}
                </span>
              ))}
            </div>
          </div>

          <div className="detail-item">
            <label>
              <input 
                type="checkbox" 
                checked={selectedFields.abilities}
                onChange={() => onFieldToggle('abilities')}
              />
              <strong>Abilities:</strong>
            </label>
            <div className="abilities-list">
              {pokemon.abilities.map((ability, idx) => (
                <span key={idx} className="ability-badge">
                  {ability}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button className="add-to-crew-btn" onClick={onAddToCrew}>
        Add to Crew
      </button>
    </div>
    </>
  );
};

export default PokemonPopup;
