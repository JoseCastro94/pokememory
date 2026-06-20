import { environment } from '../../../environments/environment';
import { PokemonResponse } from '../model/pokemon-response.model';
import { Pokemon } from '../model/pokemon.model';

export function mapPokemonResponse(response: PokemonResponse): Pokemon[] {
  return response.results.map((p) => {
    const id = extractId(p.url);
    return {
      name: p.name,
      url: p.url,
      id,
      imageUrl: `${environment.urlImgPokemon}${id}.png`,
    };
  });
}

function extractId(url: string): number {
  return Number(url.split('/').filter(Boolean).pop());
}
