import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Type mapping for dynamic styling
const TYPE_CONFIG = {
  grass: { color: '#78c850', bg: '#8bbe52', symbol: '🍃' },
  fire: { color: '#f08030', bg: '#f08030', symbol: '🔥' },
  water: { color: '#6890f0', bg: '#58abf6', symbol: '💧' },
  electric: { color: '#f8d030', bg: '#fac000', symbol: '⚡' },
  bug: { color: '#a8b820', bg: '#92bc2c', symbol: '🐛' },
  normal: { color: '#a8a878', bg: '#b1b1b1', symbol: '⚪' },
  poison: { color: '#a040a0', bg: '#a552cc', symbol: '☠️' },
  ground: { color: '#e0c068', bg: '#ca8179', symbol: '🪨' },
  fairy: { color: '#ee99ac', bg: '#f283a3', symbol: '✨' },
  fighting: { color: '#c03028', bg: '#e0306a', symbol: '🥊' },
  psychic: { color: '#f85888', bg: '#7c538c', symbol: '👁️' },
  rock: { color: '#b8a038', bg: '#b0ab81', symbol: '⛰️' },
  ghost: { color: '#705898', bg: '#825488', symbol: '👻' },
  ice: { color: '#98d8d8', bg: '#33bec8', symbol: '❄️' },
  dragon: { color: '#7038f8', bg: '#0062ae', symbol: '🐲' },
  steel: { color: '#b8b8d0', bg: '#5a8ea2', symbol: '⚙️' },
  dark: { color: '#705848', bg: '#595761', symbol: '🌙' },
};

// Capitalize first letter helper
const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Clean move names (remove hyphens)
const cleanMoveName = (name) => {
  if (!name) return 'Quick Attack';
  return name.split('-').map(capitalize).join(' ');
};

export default function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPokemon, setSelectedPokemon] = useState(null); // State for modal attributes view

  // Fetch initial list of 151 Pokémon
  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=151');
        const results = response.data.results;

        // Fetch detailed data for each Pokémon
        const detailedData = await Promise.all(
          results.map(async (pokemon) => {
            const res = await axios.get(pokemon.url);
            return res.data;
          })
        );

        setPokemonList(detailedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching Pokémon data:", error);
        setLoading(false);
      }
    };

    fetchPokemon();
  }, []);

  // Filter list based on search query
  const filteredPokemon = pokemonList.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div className="pokedex-app">
      {/* Top Header */}
      <header className="pokedex-header">
        <h1 className="pokedex-title">Pokédex</h1>

        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search Pokémon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="search-clear-btn"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      {/* Main Grid Content */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-pokeball"></div>
          <p className="loading-text">Loading Pokédex Cards...</p>
        </div>
      ) : (
        <main className="tcg-grid">
          {filteredPokemon.length > 0 ? (
            filteredPokemon.map((pokemon) => {
              const primaryType = pokemon.types[0]?.type?.name || 'normal';
              const secondaryType = pokemon.types[1]?.type?.name || null;

              const primaryConfig = TYPE_CONFIG[primaryType] || TYPE_CONFIG.normal;
              const secondaryConfig = secondaryType ? TYPE_CONFIG[secondaryType] : null;

              const hpStat = pokemon.stats.find(s => s.stat.name === 'hp')?.base_stat || 50;

              const move1 = pokemon.moves[0]?.move?.name ? cleanMoveName(pokemon.moves[0].move.name) : 'Work Up';
              const move2 = pokemon.moves[1]?.move?.name ? cleanMoveName(pokemon.moves[1].move.name) : 'Quick Attack';

              const imageUrl =
                pokemon.sprites.other?.['official-artwork']?.front_default ||
                pokemon.sprites.other?.dream_world?.front_default ||
                pokemon.sprites.front_default;

              return (
                <div
                  key={pokemon.id}
                  className="tcg-card"
                  style={{ '--card-type-color': primaryConfig.bg }}
                  onClick={() => setSelectedPokemon(pokemon)} // Open modal on click
                >
                  <div className="card-inner">
                    {/* Header: BASIC Name HP Type */}
                    <div className="card-header">
                      <div className="card-header-left">
                        <span className="stage-badge">BASIC</span>
                        <h2 className="pokemon-title-name">{capitalize(pokemon.name)}</h2>
                      </div>
                      <div className="card-header-right">
                        <span className="hp-label">HP</span>
                        <span className="hp-value">{hpStat}</span>
                        <span
                          className="type-symbol-icon"
                          style={{ backgroundColor: primaryConfig.color }}
                        >
                          {primaryConfig.symbol}
                        </span>
                      </div>
                    </div>

                    {/* Artwork Frame */}
                    <div className="artwork-frame">
                      <div className="artwork-inner">
                        <img
                          src={imageUrl}
                          alt={pokemon.name}
                          className="pokemon-artwork"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    {/* Move / Ability Rows */}
                    <div className="card-moves-section">
                      <div className="move-row">
                        <div className="move-energy-icons">
                          <span
                            className="energy-dot"
                            style={{ backgroundColor: primaryConfig.color }}
                          >
                            {primaryConfig.symbol}
                          </span>
                        </div>
                        <span className="move-type-label">Primary</span>
                        <span className="move-name">{move1}</span>
                      </div>

                      <div className="move-row">
                        <div className="move-energy-icons">
                          <span
                            className="energy-dot"
                            style={{ backgroundColor: secondaryConfig ? secondaryConfig.color : primaryConfig.color }}
                          >
                            {secondaryConfig ? secondaryConfig.symbol : primaryConfig.symbol}
                          </span>
                        </div>
                        <span className="move-type-label">
                          {secondaryType ? 'Secondary' : 'Special'}
                        </span>
                        <span className="move-name">{move2}</span>
                      </div>
                    </div>

                    {/* Bottom TCG Stats Bar */}
                    <div className="card-footer-stats">
                      <div className="stat-group">
                        <span className="stat-label">Weakness</span>
                        <span className="stat-icon-mini">🔥</span>
                      </div>
                      <div className="stat-group">
                        <span className="stat-label">Resistance</span>
                        <span className="stat-icon-mini">💧</span>
                      </div>
                      <div className="stat-group">
                        <span className="stat-label">Retreat</span>
                        <span className="retreat-circle">O</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-results-box">
              <p>No Pokémon found matching "<strong>{searchTerm}</strong>".</p>
            </div>
          )}
        </main>
      )}

      {/* Attributes Detail Modal */}
      {selectedPokemon && (
        <div className="modal-overlay" onClick={() => setSelectedPokemon(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedPokemon(null)}>✕</button>
            
            <div className="modal-header-info">
              <span className="modal-poke-id">#{String(selectedPokemon.id).padStart(3, '0')}</span>
              <h2>{capitalize(selectedPokemon.name)}</h2>
              <div className="modal-types">
                {selectedPokemon.types.map((t) => (
                  <span 
                    key={t.type.name} 
                    className="modal-type-pill"
                    style={{ backgroundColor: TYPE_CONFIG[t.type.name]?.color || '#a8a878' }}
                  >
                    {TYPE_CONFIG[t.type.name]?.symbol} {capitalize(t.type.name)}
                  </span>
                ))}
              </div>
            </div>

            <div className="modal-body-content">
              <div className="modal-img-container">
                <img 
                  src={selectedPokemon.sprites.other?.['official-artwork']?.front_default || selectedPokemon.sprites.front_default} 
                  alt={selectedPokemon.name} 
                />
              </div>

              <div className="modal-attributes">
                <div className="attribute-row">
                  <span>Height:</span>
                  <strong>{selectedPokemon.height / 10} m</strong>
                </div>
                <div className="attribute-row">
                  <span>Weight:</span>
                  <strong>{selectedPokemon.weight / 10} kg</strong>
                </div>
                <div className="attribute-row">
                  <span>Abilities:</span>
                  <strong>{selectedPokemon.abilities.map(a => capitalize(a.ability.name)).join(', ')}</strong>
                </div>

                <h4 className="stats-heading">Base Stats</h4>
                <div className="stats-list">
                  {selectedPokemon.stats.map((s) => (
                    <div key={s.stat.name} className="stat-bar-row">
                      <span className="stat-name-label">{s.stat.name.toUpperCase()}</span>
                      <span className="stat-num">{s.base_stat}</span>
                      <div className="stat-bar-track">
                        <div 
                          className="stat-bar-fill" 
                          style={{ width: `${Math.min(s.base_stat, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}