import { useState, useEffect } from 'react';
import axios from 'axios';

interface PokemonCardProps {
  pokemonId: number;
  onClick: (id: number) => void;
  isEvolutionCard?: boolean;
}

interface PokemonData {
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
}

// Type별 BackGround 색상 정의
const typeColor = [
  {type: "Grass", color: "bg-green-500"},
  {type: "Poison", color: "bg-purple-500"},
  {type: "Fire", color: "bg-red-500"},
  {type: "Water", color: "bg-blue-500"},
  {type: "Electric", color: "bg-yellow-500"},
  {type: "Ice", color: "bg-cyan-500"},
  {type: "Fighting", color: "bg-orange-500"},
  {type: "Ground", color: "bg-yellow-600"},
  {type: "Flying", color: "bg-indigo-400"},
  {type: "Psychic", color: "bg-pink-500"},
  {type: "Bug", color: "bg-lime-500"},
  {type: "Rock", color: "bg-yellow-700"},
  {type: "Ghost", color: "bg-purple-600"},
  {type: "Dragon", color: "bg-indigo-600"},
  {type: "Dark", color: "bg-gray-700"},
  {type: "Steel", color: "bg-gray-500"},
  {type: "Fairy", color: "bg-pink-300"},
  {type: "Normal", color: "bg-gray-400"}
];

export default function PokemonCard({ pokemonId, onClick, isEvolutionCard = false }: PokemonCardProps) {
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        setLoading(true);
        const response = await axios.get<PokemonData>(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        setPokemon(response.data);
        setError(null);
      } catch (err) {
        setError('포켓몬 정보를 불러올 수 없습니다.');
        console.error('포켓몬 데이터 가져오기 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
  }, [pokemonId]);

  if (loading) {
    return (
      <div className="bg-gray-100 rounded-xl shadow-lg p-4">
        <div className="animate-pulse">
          <div className="w-full h-48 bg-gray-300 rounded-t-xl mb-4"></div>
          <div className="h-6 bg-gray-300 rounded mb-3"></div>
          <div className="flex gap-2 justify-center">
            <div className="h-6 w-16 bg-gray-300 rounded"></div>
            <div className="h-6 w-16 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="bg-gray-100 rounded-xl shadow-lg p-4">
        <div className="text-center text-red-500">
          <div className="w-full h-48 bg-gray-200 rounded-t-xl mb-4 flex items-center justify-center">
            <span className="text-sm">오류 발생</span>
          </div>
          <div className="text-sm text-gray-600">포켓몬 #{pokemonId}</div>
        </div>
      </div>
    );
  }

  const pokemonName = pokemon.name[0].toUpperCase() + pokemon.name.slice(1);
  const pokemonImage = pokemon.sprites.other['official-artwork'].front_default;
  const pokemonTypes = pokemon.types.map(t => 
    t.type.name[0].toUpperCase() + t.type.name.slice(1)
  );

  return (
    <div 
      className={`bg-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${isEvolutionCard ? 'w-36' : 'cursor-pointer'}`}
      onClick={() => onClick(pokemonId)}
    >
      <img 
        src={pokemonImage} 
        alt={pokemonName} 
        className={`w-full ${isEvolutionCard ? 'h-24' : 'h-48'} object-contain p-4 bg-gray-100 rounded-t-xl`}
      />
      <div className={`${isEvolutionCard ? 'p-2' : 'p-4'}`}>
        <h3 className={`text-center font-bold ${isEvolutionCard ? 'text-sm mb-2' : 'text-xl mb-3'} text-gray-800`}>
          {pokemonName}
        </h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {pokemonTypes.map((type) => {
            const found = typeColor.find((t) => t.type === type);
            const bgColor = found ? found.color : "bg-gray-400";
            return(
              <span 
                key={type} 
                className={`${bgColor} text-white ${isEvolutionCard ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'} rounded-md font-semibold`}
              >
                {type}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
