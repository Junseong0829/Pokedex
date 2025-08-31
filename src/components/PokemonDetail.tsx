import { useState, useEffect } from 'react';
import axios from 'axios';
import PokemonCard from './PokemonCard';

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

interface EvolutionChain {
  chain: {
    species: {
      name: string;
      url: string;
    };
    evolves_to: Array<{
      species: {
        name: string;
        url: string;
      };
      evolution_details: Array<{
        trigger: {
          name: string;
        };
        min_level?: number;
        item?: {
          name: string;
        };
      }>;
      evolves_to: Array<{
        species: {
          name: string;
          url: string;
        };
        evolution_details: Array<{
          trigger: {
            name: string;
          };
          min_level?: number;
          item?: {
            name: string;
          };
        }>;
        evolves_to: any[];
      }>;
    }>;
  };
}

export default function PokemonDetail({ pokemonId, onClose }: PokemonDetailProps) {
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [evolutionChain, setEvolutionChain] = useState<EvolutionChain | null>(null);
  const [evolutionPokemonIds, setEvolutionPokemonIds] = useState<number[]>([]);
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
      const response_2 = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
      setDescription(response_2.data.flavor_text_entries[0].flavor_text);
      
      // 진화 체인 정보 가져오기
      await fetchEvolutionChain();
    } catch (error) {
      console.error('포켓몬 상세 정보 가져오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvolutionChain = async () => {
    try {
      // species 정보 가져오기
      const speciesResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
      const evolutionChainUrl = speciesResponse.data.evolution_chain.url;
      
      // 진화 체인 정보 가져오기
      const evolutionResponse = await axios.get<EvolutionChain>(evolutionChainUrl);
      setEvolutionChain(evolutionResponse.data);
      
      // 진화 관련 포켓몬 ID들 추출
      const ids = extractEvolutionPokemonIds(evolutionResponse.data.chain);
      setEvolutionPokemonIds(ids);
    } catch (error) {
      console.error('진화 체인 정보 가져오기 실패:', error);
    }
  };

  const extractEvolutionPokemonIds = (chain: any): number[] => {
    const ids: number[] = [];
    
    // 현재 포켓몬 ID 추출
    const currentId = extractIdFromUrl(chain.species.url);
    if (currentId) ids.push(currentId);
    
    // 첫 번째 진화 단계
    chain.evolves_to.forEach((evolution: any) => {
      const evolutionId = extractIdFromUrl(evolution.species.url);
      if (evolutionId) ids.push(evolutionId);
      
      // 두 번째 진화 단계
      evolution.evolves_to.forEach((finalEvolution: any) => {
        const finalEvolutionId = extractIdFromUrl(finalEvolution.species.url);
        if (finalEvolutionId) ids.push(finalEvolutionId);
      });
    });
    
    return ids;
  };

  const extractIdFromUrl = (url: string): number | null => {
    const match = url.match(/\/(\d+)\/$/);
    return match ? parseInt(match[1]) : null;
  };

  const getStatValue = (statName: string): number => {
    if (!pokemon) return 0;
    const stat = pokemon.stats.find(s => s.stat.name === statName);
    return stat ? stat.base_stat : 0;
  };

  if (!pokemonId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
              <h3 className="text-xl font-bold mb-4 text-gray-400">Stats</h3>
              <div className="grid grid-cols-3 gap-4">
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
                <div className="text-center">
                  <div className="text-sm text-gray-600">Special Attack</div>
                  <div className="text-lg font-semibold">{getStatValue('special-attack')}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Special Defense</div>
                  <div className="text-lg font-semibold">{getStatValue('special-defense')}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-gray-400">Description</h3>
              <p className="font-medium leading-relaxed">
                {description || "포켓몬에 대한 설명이 없습니다."}
              </p>
            </div>

            {/* Evolution */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-gray-400">Evolution</h3>
              {evolutionPokemonIds.length > 0 ? (
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {evolutionPokemonIds.map((pokemonId, index) => (
                    <div key={pokemonId} className="flex items-center">
                      <PokemonCard
                        pokemonId={pokemonId}
                        onClick={() => {}} // 진화 카드 클릭 시 아무것도 하지 않음
                        isEvolutionCard={true}
                      />
                      {index < evolutionPokemonIds.length - 1 && (
                        <div className="text-2xl text-gray-400 mx-2">→</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">진화 정보가 없습니다.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">포켓몬 정보를 찾을 수 없습니다.</div>
        )}
      </div>
    </div>
  );
}
