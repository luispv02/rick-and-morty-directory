export interface Character {
  id: number;
  name: string;
  status: 'Alive' | 'Dead' | 'unknown';
  species: string;
  image: string;
  gender: string;
  origin: CharacterLocation;
  location: CharacterLocation;
  episode: string[];
}

export interface CharacterResponse {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: Character[];
}

export interface CharacterFilters {
  name?: string;
  status?: string;
  species?: string;
  gender?: string;
}

export interface CharacterLocation {
  name: string;
  url: string;
}

export interface Episode {
  id: number;
  name: string;
  episode: string;
  air_date: string;
}