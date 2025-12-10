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
    // Embedded data guarantees the app works even if assets fail to load
    const fallbackData: Player[] = [
      { "id": 1, "name": "Rutik", "strength": "pro" },
      { "id": 2, "name": "Aman", "strength": "medium" },
      { "id": 3, "name": "Sahil", "strength": "noob" },
      { "id": 4, "name": "Karan", "strength": "medium" }
    ];

    // Attempt to load from standard assets path, but fail gracefully to hardcoded data
    this.http.get<Player[]>('assets/players.json').subscribe({
      next: (data) => {
        this.players.set(data);
        this.initialized = true;
      },
      error: () => {
        // Silent fallback for environments where assets are not served correctly
        this.players.set(fallbackData);
        this.initialized = true;
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

  swapPlayers(player1Id: number, player2Id: number) {
    const currentTeams = this.teams();
    
    // Helper to find location
    const findLocation = (pId: number) => {
      for (let tIdx = 0; tIdx < currentTeams.length; tIdx++) {
        const pIdx = currentTeams[tIdx].players.findIndex(p => p.id === pId);
        if (pIdx !== -1) return { tIdx, pIdx };
      }
      return null;
    };

    const loc1 = findLocation(player1Id);
    const loc2 = findLocation(player2Id);

    if (loc1 && loc2) {
      // Update logic: Create deep copy to ensure immutability
      // We map over teams to create a new array, and spread the team object.
      // Crucially, we must also spread the players array within the modified teams.
      
      const newTeams = currentTeams.map((team, index) => {
         if (index === loc1.tIdx || index === loc2.tIdx) {
            return { ...team, players: [...team.players] as [Player, Player] };
         }
         return team;
      });
      
      const p1 = newTeams[loc1.tIdx].players[loc1.pIdx];
      const p2 = newTeams[loc2.tIdx].players[loc2.pIdx];

      // Perform the swap
      newTeams[loc1.tIdx].players[loc1.pIdx] = p2;
      newTeams[loc2.tIdx].players[loc2.pIdx] = p1;
      
      this.teams.set(newTeams);
    }
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

  // Decrement a specific team's score (Undo for one side)
  decrementPoint(matchId: number, teamId: number) {
    this.matches.update(list => list.map(m => {
      if (m.id !== matchId) return m;

      const isTeamA = teamId === m.teamAId;
      // Prevent negative scores
      if (isTeamA && m.scoreA <= 0) return m;
      if (!isTeamA && m.scoreB <= 0) return m;

      // Find the most recent history entry for this team to remove
      // We search from the end to remove the latest action of this team
      const reversedHistory = [...m.history].reverse();
      const indexFromEnd = reversedHistory.findIndex(h => h.teamId === teamId);
      
      let newHistory = m.history;
      if (indexFromEnd !== -1) {
         const actualIndex = m.history.length - 1 - indexFromEnd;
         newHistory = [...m.history];
         newHistory.splice(actualIndex, 1);
      }

      return {
        ...m,
        scoreA: isTeamA ? m.scoreA - 1 : m.scoreA,
        scoreB: !isTeamA ? m.scoreB - 1 : m.scoreB,
        history: newHistory
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