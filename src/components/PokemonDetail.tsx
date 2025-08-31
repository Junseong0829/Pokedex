import { useState, useEffect } from 'react';
import axios from 'axios';

interface PokemonDetailProps {
  pokemonId: number | null;
  onClose: () => void;
}

interface PokemonDetail {
  id: number;
  name: string;
  sprites: {
    other: {
      'official-artwork': {
        front_default: string;
      }
    }
  };
  types: Array<{
    type: {
      name: string;
    }
  }>;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    }
  }>;
  description?: string;
}

export default function PokemonDetail({ pokemonId, onClose }: PokemonDetailProps) {
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pokemonId) {
      fetchPokemonDetail();
    }
  }, [pokemonId]);

  const fetchPokemonDetail = async () => {
    if (!pokemonId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
      setPokemon(response.data);
    } catch (error) {
      console.error('포켓몬 상세 정보 가져오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatValue = (statName: string): number => {
    if (!pokemon) return 0;
    const stat = pokemon.stats.find(s => s.stat.name === statName);
    return stat ? stat.base_stat : 0;
  };

  if (!pokemonId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          
          
          {/* 로고 */}
          <img src="/logo.svg" alt="logo" className="w-25" />
          
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">로딩 중...</div>
        ) : pokemon ? (
          <div>
            {/* 포켓몬 이미지 및 이름 */}
            <div className="text-center mb-6">
              <img
                src={pokemon.sprites.other['official-artwork'].front_default}
                alt={pokemon.name}
                className="w-48 h-48 mx-auto mb-4"
              />
              <h2 className="text-3xl font-bold text-gray-800 capitalize">
                {pokemon.name}
              </h2>
            </div>

            {/* Stats (능력치) */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600">HP</div>
                  <div className="text-lg font-semibold">{getStatValue('hp')}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Attack</div>
                  <div className="text-lg font-semibold">{getStatValue('attack')}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Defense</div>
                  <div className="text-lg font-semibold">{getStatValue('defense')}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Speed</div>
                  <div className="text-lg font-semibold">{getStatValue('speed')}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {pokemon.description || "포켓몬에 대한 설명이 없습니다."}
              </p>
            </div>

            {/* Evolution */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Evolution</h3>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png`}
                    alt="Bulbasaur"
                    className="w-16 h-16 mx-auto mb-2"
                  />
                  <div className="text-sm font-semibold">Bulbasaur</div>
                  <div className="flex gap-1 justify-center">
                    <span className="px-2 py-1 text-xs rounded-full text-white bg-green-500">Grass</span>
                    <span className="px-2 py-1 text-xs rounded-full text-white bg-purple-500">Poison</span>
                  </div>
                </div>
                
                <div className="text-2xl text-gray-400">→</div>
                
                <div className="text-center">
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png`}
                    alt="Ivysaur"
                    className="w-16 h-16 mx-auto mb-2"
                  />
                  <div className="text-sm font-semibold">Ivysaur</div>
                  <div className="flex gap-1 justify-center">
                    <span className="px-2 py-1 text-xs rounded-full text-white bg-green-500">Grass</span>
                    <span className="px-2 py-1 text-xs rounded-full text-white bg-purple-500">Poison</span>
                  </div>
                </div>
                
                <div className="text-2xl text-gray-400">→</div>
                
                <div className="text-center">
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png`}
                    alt="Venusaur"
                    className="w-16 h-16 mx-auto mb-2"
                  />
                  <div className="text-sm font-semibold">Venusaur</div>
                  <div className="flex gap-1 justify-center">
                    <span className="px-2 py-1 text-xs rounded-full text-white bg-green-500">Grass</span>
                    <span className="px-2 py-1 text-xs rounded-full text-white bg-purple-500">Poison</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">포켓몬 정보를 찾을 수 없습니다.</div>
        )}
      </div>
    </div>
  );
}
