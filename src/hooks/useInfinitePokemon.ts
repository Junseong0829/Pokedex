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


const fetchPokemonPage = async (page: number, pageSize: number = 50) => {
  const startId = page * pageSize + 1;
  const endId = startId + pageSize - 1;
  
  // 1010개를 넘어가는 포켓몬 ID는 요청하지 않음
  const maxPokemonId = 1010;
  
  // 시작 ID가 최대 ID를 넘어가면 빈 배열 반환
  if (startId > maxPokemonId) {
    return [];
  }
  
  const promises = [];
  for (let i = startId; i <= endId; i++) {
    // 1010개를 넘어가는 ID는 건너뛰기
    if (i > maxPokemonId) break;
    
    promises.push(axios.get<PokemonData>(`https://pokeapi.co/api/v2/pokemon/${i}`));
  }
  
  const responses = await Promise.all(promises);
  
  return responses.map((res) => {
    const data = res.data;
    
    // 안전하게 데이터 처리
    if (!data || !data.name || !data.sprites || !data.types) {
      return null;
    }
    
    const resName = data.name[0].toUpperCase() + data.name.slice(1);
    const resImage = data.sprites.other['official-artwork']?.front_default || '';
    const resType = data.types.map(t => 
      t.type?.name?.[0]?.toUpperCase() + t.type?.name?.slice(1) || ''
    ).filter(Boolean);
    
    return {
      id: data.id,
      name: resName,
      image: resImage,
      type: resType
    };
  }).filter(Boolean); // null 값 제거
};

export const useInfinitePokemon = () => {
  return useInfiniteQuery({
    queryKey: ['pokemon', 'infinite'],
    queryFn: ({ pageParam = 0 }) => fetchPokemonPage(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // 마지막 페이지가 비어있으면 더 이상 로드할 필요 없음
      if (lastPage.length === 0) {
        return undefined;
      }
      
      // 1010개를 넘어가면 중단
      const totalPokemon = allPages.flat().length;
      if (totalPokemon >= 1010) {
        return undefined;
      }
      
      // 계속 진행
      return allPages.length;
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
};
