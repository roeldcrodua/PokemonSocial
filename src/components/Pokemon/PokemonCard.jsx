import React from 'react';
import './PokemonCard.css';

const PokemonCard = ({ pokemon, onClick }) => {
  const handleClick = (event) => {
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <div 
      className="pokemon-card"
      onClick={handleClick}
    >
      <img 
        src={pokemon.imageUrl} 
        alt={pokemon.name}
        loading="lazy"
      />
    </div>
  );
};

export default PokemonCard;
