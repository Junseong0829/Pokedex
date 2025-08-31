import {useState, useEffect} from 'react';
import { createFileRoute} from "@tanstack/react-router";
import { useInView } from 'react-intersection-observer';
import PokemonDetail from "../../components/PokemonDetail";
import PokemonCard from "../../components/PokemonCard";
import SuspenseWrapper from "../../components/SuspenseWrapper";
import { useInfinitePokemon } from "../../hooks/useInfinitePokemon";

export const Route = createFileRoute("/pages/pokemon")({
  component: Pokemon,
});

function PokemonContent() {
    const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // 무한 스크롤을 위한 intersection observer
    const { ref: loadMoreRef, inView } = useInView();
    
    // TanStack Query 무한 스크롤 훅 사용
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error
    } = useInfinitePokemon();
    
    // 무한 스크롤 트리거
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handlePokemonClick = (id: number) => {
        setSelectedPokemonId(id);
    };

    const closeDetail = () => {
        setSelectedPokemonId(null);
    };

    // 모든 포켓몬 데이터를 평면화 
    const allPokemon = data?.pages?.flat() || [];
    
    // 검색 필터링 
    const filteredPokemon = allPokemon.filter(pokemon =>
        pokemon?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen">
            {/* 헤더 */}
            <div className="bg-white">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    {/* Sign In 버튼 */}
                    <div className="flex justify-end items-center mb-10 gap-3">
                        <span className="text-gray-500 text-md font-medium">Sign In</span>  
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <img src="/login.svg" alt="login" className="" />
                        </div>
                    </div>
                    <div className="flex justify-center items-center">
                        {/* 로고 */}
                        <div className="flex justify-center items-center">
                            <img src="/logo.svg" alt="logo" className="" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 검색 바 */}
            <div className="max-w-5xl mx-auto px-4 py-6 mb-10">
                <div className="relative max-w-3xl mx-auto">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">🔍</span>
                    </div>
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-100 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* 포켓몬 그리드 */}
            <div className="max-w-5xl mx-auto px-4 pb-8">
                {isLoading ? (
                    <div className="text-center py-8 text-gray-600">
                        포켓몬 데이터를 불러오는 중...
                    </div>
                ) : isError ? (
                    <div className="text-center py-8 text-red-600">
                        오류가 발생했습니다: {error?.message}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredPokemon
                                .filter((pokemon): pokemon is NonNullable<typeof pokemon> => 
                                    pokemon !== null && pokemon.id !== undefined && pokemon.name !== undefined
                                )
                                .map((pokemon) => (
                                    <PokemonCard
                                        key={`${pokemon.name}-${pokemon.id}`}
                                        pokemonId={pokemon.id}
                                        onClick={handlePokemonClick}
                                    />
                                ))
                            }
                        </div>
                        
                        {/* 무한 스크롤 로딩 인디케이터 */}
                        {isFetchingNextPage && hasNextPage && (
                            <div className="text-center py-8 text-gray-600">
                                다음 페이지를 불러오는 중...
                            </div>
                        )}

                        {/* 모든 포켓몬 로드 완료 메시지 */}
                        {!hasNextPage && allPokemon.length > 0 && (
                            <div className="text-center py-8 text-gray-500">
                                🔥 모든 포켓몬을 불러왔습니다! (총 <span className="text-blue-600 font-medium">{allPokemon.length}</span>개)
                            </div>
                        )}

                        {/* 무한 스크롤 트리거 요소 (hasNextPage가 true일 때만) */}
                        {hasNextPage && (
                            <div ref={loadMoreRef} className="h-10" />
                        )}
                    </>
                )}
            </div>

            {/* 포켓몬 상세 정보 모달 */}
            {selectedPokemonId && (
                <PokemonDetail 
                    pokemonId={selectedPokemonId} 
                    onClose={closeDetail} 
                />
            )}
        </div>
    );
}

function Pokemon(){
    return (
        <SuspenseWrapper>
            <PokemonContent />
        </SuspenseWrapper>
    );
}

export default Pokemon;