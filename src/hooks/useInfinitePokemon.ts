import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';

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

interface PokemonList {
  name: string;
  image: string;
  type: string[];
}

const fetchPokemonPage = async (page: number, pageSize: number = 20) => {
  const startId = page * pageSize + 1;
  const endId = startId + pageSize - 1;
  
  const promises = [];
  for (let i = startId; i <= endId; i++) {
    promises.push(axios.get<PokemonData>(`https://pokeapi.co/api/v2/pokemon/${i}`));
  }
  
  const responses = await Promise.all(promises);
  
  return responses.map((res, index) => {
    const data = res.data;
    const resName = data.name[0].toUpperCase() + data.name.slice(1);
    const resImage = data.sprites.other['official-artwork'].front_default;
    const resType = data.types.map(t => 
      t.type.name[0].toUpperCase() + t.type.name.slice(1)
    );
    
    return {
      name: resName,
      image: resImage,
      type: resType
    };
  });
};

export const useInfinitePokemon = () => {
  return useInfiniteQuery({
    queryKey: ['pokemon', 'infinite'],
    queryFn: ({ pageParam = 0 }) => fetchPokemonPage(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // 마지막 페이지가 20개 미만이면 더 이상 페이지가 없음
      if (lastPage.length < 20) {
        return undefined;
      }
      return allPages.length;
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
};
