import { Injectable, signal, computed, effect } from '@angular/core';

export type Strength = 'pro' | 'medium' | 'noob';

export interface Player {
  id: number;
  name: string;
  strength: Strength;
}

export interface Team {
  id: number;
  players: [Player, Player];
  name?: string; // Optional custom name
}

export interface MatchHistoryItem {
  teamId: number; // The ID of the team that scored
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
  private readonly STORAGE_KEY = 'picklescore_db_v1';

  // --- State ---
  readonly players = signal<Player[]>([
    { id: 1, name: "Rutik", strength: "pro" },
    { id: 2, name: "Aman", strength: "medium" },
    { id: 3, name: "Sahil", strength: "noob" },
    { id: 4, name: "Karan", strength: "medium" }
  ]);

  readonly teams = signal<Team[]>([]);
  readonly matches = signal<Match[]>([]);
  
  // UI State
  readonly activeMatchId = signal<number | null>(null);

  // --- Computed ---
  readonly activeMatch = computed(() => {
    const id = this.activeMatchId();
    return this.matches().find(m => m.id === id) || null;
  });

  readonly activeMatchTeams = computed(() => {
    const match = this.activeMatch();
    if (!match) return null;
    
    const teamA = this.teams().find(t => t.id === match.teamAId);
    const teamB = this.teams().find(t => t.id === match.teamBId);
    
    return { teamA, teamB };
  });

  constructor() {
    this.loadData();

    // Auto-save data whenever any signal changes
    effect(() => {
      this.saveData();
    });
  }

  private loadData() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const db = JSON.parse(stored);
        if (Array.isArray(db.players)) this.players.set(db.players);
        if (Array.isArray(db.teams)) this.teams.set(db.teams);
        if (Array.isArray(db.matches)) this.matches.set(db.matches);
        if (db.activeMatchId !== undefined) this.activeMatchId.set(db.activeMatchId);
      } catch (e) {
        console.error('Failed to load PickleScore data', e);
      }
    }
  }

  private saveData() {
    const db = {
      players: this.players(),
      teams: this.teams(),
      matches: this.matches(),
      activeMatchId: this.activeMatchId()
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(db));
  }

  // --- Actions: Players ---
  addPlayer(name: string, strength: Strength) {
    const newPlayer: Player = {
      id: Date.now(),
      name: name.trim(),
      strength
    };
    this.players.update(list => [...list, newPlayer]);
  }

  deletePlayer(id: number) {
    this.players.update(list => list.filter(p => p.id !== id));
    // Also remove teams containing this player to maintain integrity
    this.teams.update(list => list.filter(t => t.players[0].id !== id && t.players[1].id !== id));
  }

  // --- Actions: Teams ---
  generateTeams() {
    const currentPlayers = [...this.players()];
    
    // Sort logic: Assign weights to balance. Pro=3, Med=2, Noob=1.
    // Goal: Pair High + Low.
    const getWeight = (s: Strength) => s === 'pro' ? 3 : s === 'medium' ? 2 : 1;
    
    // Sort descending by weight
    currentPlayers.sort((a, b) => getWeight(b.strength) - getWeight(a.strength));
    
    const newTeams: Team[] = [];
    let teamIdCounter = Date.now();

    // Simple balancing algorithm: 
    // Take strongest available, pair with weakest available.
    while (currentPlayers.length >= 2) {
      const p1 = currentPlayers.shift()!;
      const p2 = currentPlayers.pop()!;
      
      newTeams.push({
        id: teamIdCounter++,
        players: [p1, p2]
      });
    }

    // Note: If odd number, one player is left out (logic as per requirement "pair remaining players randomly" implies strictly pairs)
    this.teams.set(newTeams);
  }

  // --- Actions: Matches ---
  startMatch(teamAId: number, teamBId: number) {
    const newMatch: Match = {
      id: Date.now(),
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

      // Create history item
      const historyItem: MatchHistoryItem = {
        teamId,
        timestamp: Date.now()
      };

      return {
        ...m,
        scoreA: teamId === m.teamAId ? m.scoreA + 1 : m.scoreA,
        scoreB: teamId === m.teamBId ? m.scoreB + 1 : m.scoreB,
        history: [...m.history, historyItem]
      };
    }));
  }

  undoLastPoint(matchId: number) {
    this.matches.update(list => list.map(m => {
      if (m.id !== matchId || m.history.length === 0) return m;

      const newHistory = [...m.history];
      const lastAction = newHistory.pop(); // Remove last

      if (!lastAction) return m;

      return {
        ...m,
        scoreA: lastAction.teamId === m.teamAId ? m.scoreA - 1 : m.scoreA,
        scoreB: lastAction.teamId === m.teamBId ? m.scoreB - 1 : m.scoreB,
        history: newHistory
      };
    }));
  }

  resetMatch(matchId: number) {
    this.matches.update(list => list.map(m => {
      if (m.id !== matchId) return m;
      return {
        ...m,
        scoreA: 0,
        scoreB: 0,
        history: []
      };
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