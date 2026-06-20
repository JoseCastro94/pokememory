import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PokemonResponse } from '../model/pokemon-response.model';

@Service()
export class PokemonService {
  private http = inject(HttpClient);

  getPokemons(limit: number, offset: number): Observable<PokemonResponse> {
    const params = new HttpParams()
      .set('limit', limit)
      .set('offset', offset);

    return this.http.get<PokemonResponse>(environment.urlApiPokemon, { params });
  }
}
