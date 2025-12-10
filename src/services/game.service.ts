import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type Strength = 'pro' | 'medium' | 'noob';

export interface Player {
  id: number;
  name: string;
  strength: Strength;
}

export interface Team {
  id: number;
  players: [Player, Player];
  name?: string;
}

export interface MatchHistoryItem {
  teamId: number;
  timestamp: number;
}

export interface Match {
  id: number;
  teamAId: number;
  teamBId: number;
  scoreA: number;
  scoreB: number;
  history: MatchHistoryItem[];
  status: 'active' | 'completed';
  startTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly DB_KEY = 'picklescore_json_db';
  private http = inject(HttpClient);
  private initialized = false;

  // The "Database" Tables
  readonly players = signal<Player[]>([]);
  readonly teams = signal<Team[]>([]);
  readonly matches = signal<Match[]>([]);
  readonly activeMatchId = signal<number | null>(null);

  // Computed Views
  readonly activeMatch = computed(() => {
    const id = this.activeMatchId();
    return this.matches().find(m => m.id === id) || null;
  });

  readonly activeMatchTeams = computed(() => {
    const match = this.activeMatch();
    if (!match) return null;
    return { 
      teamA: this.teams().find(t => t.id === match.teamAId),
      teamB: this.teams().find(t => t.id === match.teamBId)
    };
  });

  constructor() {
    this.initializeDatabase();

    // Database Watcher: Auto-commit changes to local storage
    effect(() => {
      const dbState = {
        players: this.players(),
        teams: this.teams(),
        matches: this.matches(),
        activeMatchId: this.activeMatchId()
      };
      
      if (this.initialized) {
        localStorage.setItem(this.DB_KEY, JSON.stringify(dbState));
      }
    });
  }

  private initializeDatabase() {
    const localData = localStorage.getItem(this.DB_KEY);
    
    if (localData) {
      // Load from Local DB
      try {
        const db = JSON.parse(localData);
        this.players.set(db.players || []);
        this.teams.set(db.teams || []);
        this.matches.set(db.matches || []);
        this.activeMatchId.set(db.activeMatchId || null);
        this.initialized = true;
      } catch (err) {
        console.error('DB Corrupt, resetting to JSON file seed', err);
        this.seedFromJSON();
      }
    } else {
      // First run: Fetch from JSON file (Seed)
      this.seedFromJSON();
    }
  }

  private seedFromJSON() {
    this.http.get<Player[]>('src/assets/players.json').subscribe({
      next: (data) => {
        this.players.set(data);
        this.initialized = true;
      },
      error: (err) => {
        console.error('Could not fetch players.json', err);
        this.initialized = true; // Fallback to empty
      }
    });
  }

  // --- Database Operations: Players ---

  addPlayer(name: string, strength: Strength) {
    const currentList = this.players();
    // Auto-increment ID based on max existing ID (Like SQL)
    const maxId = currentList.length > 0 ? Math.max(...currentList.map(p => p.id)) : 0;
    
    const newPlayer: Player = {
      id: maxId + 1,
      name: name.trim(),
      strength
    };

    // Insert into DB
    this.players.update(list => [...list, newPlayer]);
  }

  deletePlayer(id: number) {
    // Delete from Players Table
    this.players.update(list => list.filter(p => p.id !== id));
    
    // Cascade Delete: Remove teams that included this player
    this.teams.update(list => list.filter(t => t.players[0].id !== id && t.players[1].id !== id));
  }

  // --- Database Operations: Teams ---

  generateTeams() {
    const roster = [...this.players()];
    // Algorithm: Sort by strength weight to create balanced pairs (High + Low)
    const getWeight = (s: Strength) => s === 'pro' ? 3 : s === 'medium' ? 2 : 1;
    roster.sort((a, b) => getWeight(b.strength) - getWeight(a.strength));
    
    const newTeams: Team[] = [];
    let nextTeamId = 1;

    // Reset teams table
    while (roster.length >= 2) {
      const p1 = roster.shift()!;
      const p2 = roster.pop()!;
      
      newTeams.push({
        id: nextTeamId++,
        players: [p1, p2]
      });
    }
    this.teams.set(newTeams);
  }

  // --- Database Operations: Matches ---

  startMatch(teamAId: number, teamBId: number) {
    const newMatch: Match = {
      id: Date.now(), // Unique Session ID
      teamAId,
      teamBId,
      scoreA: 0,
      scoreB: 0,
      history: [],
      status: 'active',
      startTime: Date.now()
    };
    
    this.matches.update(list => [newMatch, ...list]);
    this.activeMatchId.set(newMatch.id);
  }

  scorePoint(matchId: number, teamId: number) {
    this.matches.update(list => list.map(m => {
      if (m.id !== matchId) return m;
      
      const isTeamA = teamId === m.teamAId;
      return {
        ...m,
        scoreA: isTeamA ? m.scoreA + 1 : m.scoreA,
        scoreB: !isTeamA ? m.scoreB + 1 : m.scoreB,
        history: [...m.history, { teamId, timestamp: Date.now() }]
      };
    }));
  }

  undoLastPoint(matchId: number) {
    this.matches.update(list => list.map(m => {
      if (m.id !== matchId || m.history.length === 0) return m;

      const newHistory = [...m.history];
      const lastAction = newHistory.pop(); 

      if (!lastAction) return m;

      const isTeamA = lastAction.teamId === m.teamAId;
      return {
        ...m,
        scoreA: isTeamA ? m.scoreA - 1 : m.scoreA,
        scoreB: !isTeamA ? m.scoreB - 1 : m.scoreB,
        history: newHistory
      };
    }));
  }

  resetMatch(matchId: number) {
    this.matches.update(list => list.map(m => {
      if (m.id !== matchId) return m;
      return { ...m, scoreA: 0, scoreB: 0, history: [] };
    }));
  }

  endMatch(matchId: number) {
    this.matches.update(list => list.map(m => {
      if (m.id !== matchId) return m;
      return { ...m, status: 'completed' };
    }));
    this.activeMatchId.set(null);
  }
}