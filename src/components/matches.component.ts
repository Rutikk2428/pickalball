import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pb-8">
      
      <!-- Sticky Header -->
      <div class="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-[#EFF3F4] cursor-pointer">
         <div class="h-safe w-full"></div>
         <div class="px-4 py-3 flex items-center justify-between">
             <div>
                <h2 class="text-xl font-bold text-[#0F1419] leading-none">Matches</h2>
                <div class="text-xs text-[#536471] mt-0.5">Live scores & history</div>
             </div>
         </div>
      </div>

      <div class="p-0">
        
        <!-- ACTIVE MATCH UI -->
        @if (service.activeMatch(); as match) {
          @let teams = service.activeMatchTeams();
          
          <div class="border-b border-[#EFF3F4] p-4 bg-white">
            <div class="flex justify-between items-center mb-4">
              <div class="flex items-center gap-2">
                 <span class="relative flex h-2.5 w-2.5">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                 </span>
                 <span class="text-xs font-bold text-[#0F1419] uppercase tracking-wider">Live Match</span>
              </div>
              <button (click)="service.endMatch(match.id)" class="text-xs font-bold text-white bg-[#0F1419] px-4 py-1.5 rounded-full hover:bg-black transition-colors">End Match</button>
            </div>
            
            <div class="flex rounded-2xl h-[320px] shadow-sm overflow-hidden border border-[#0F1419] relative">
               <!-- VS Badge -->
               <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white border border-[#0F1419] rounded-full w-8 h-8 flex items-center justify-center font-black text-[10px] text-[#0F1419]">VS</div>

               <!-- Team A (Black) -->
               <div class="flex-1 bg-[#0F1419] text-white relative flex flex-col items-center justify-center p-4 cursor-pointer transition-all duration-200 ease-out select-none"
                    [class.scale-[1.02]]="lastScored() === 'A'"
                    [class.z-10]="lastScored() === 'A'"
                    (click)="onScore(match.id, match.teamAId, 'A')">
                  
                  <div class="text-[11px] font-bold uppercase tracking-[0.2em] opacity-60 mb-2 relative z-10">Team A</div>
                  <div class="text-8xl font-black tracking-tighter transition-transform duration-200 ease-out relative z-10" 
                       [class.scale-125]="lastScored() === 'A'"
                       [class.translate-y-[-10px]]="lastScored() === 'A'">
                       {{ match.scoreA }}
                  </div>
                  <div class="text-sm font-medium mt-4 text-center max-w-[100px] truncate opacity-80 relative z-10">{{ teams?.teamA?.players?.[0]?.name }}</div>
                  
                  <!-- Flash Overlay -->
                  <div class="absolute inset-0 bg-white/20 transition-opacity duration-200 pointer-events-none opacity-0" 
                       [class.opacity-100]="lastScored() === 'A'"></div>
                  <!-- Radial Glow -->
                  <div class="absolute inset-0 transition-opacity duration-300 pointer-events-none opacity-0"
                       [class.opacity-100]="lastScored() === 'A'"
                       style="background: radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%);"></div>
               </div>

               <!-- Team B (White) -->
               <div class="flex-1 bg-white text-[#0F1419] relative flex flex-col items-center justify-center p-4 cursor-pointer transition-all duration-200 ease-out select-none border-l border-[#0F1419]"
                    [class.scale-[1.02]]="lastScored() === 'B'"
                    [class.z-10]="lastScored() === 'B'"
                    (click)="onScore(match.id, match.teamBId, 'B')">
                  
                  <div class="text-[11px] font-bold uppercase tracking-[0.2em] text-[#536471] mb-2 relative z-10">Team B</div>
                  <div class="text-8xl font-black tracking-tighter transition-transform duration-200 ease-out relative z-10" 
                       [class.scale-125]="lastScored() === 'B'"
                       [class.translate-y-[-10px]]="lastScored() === 'B'">
                       {{ match.scoreB }}
                  </div>
                  <div class="text-sm font-medium mt-4 text-center max-w-[100px] truncate text-[#536471] relative z-10">{{ teams?.teamB?.players?.[0]?.name }}</div>

                  <!-- Flash Overlay -->
                  <div class="absolute inset-0 bg-black/5 transition-opacity duration-200 pointer-events-none opacity-0" 
                       [class.opacity-100]="lastScored() === 'B'"></div>
                   <!-- Radial Glow -->
                  <div class="absolute inset-0 transition-opacity duration-300 pointer-events-none opacity-0"
                       [class.opacity-100]="lastScored() === 'B'"
                       style="background: radial-gradient(circle at center, rgba(0,0,0,0.05) 0%, transparent 70%);"></div>
               </div>
            </div>
            
            <!-- Controls -->
            <div class="flex justify-center gap-6 mt-6">
               <button (click)="service.undoLastPoint(match.id)" [disabled]="match.history.length === 0" class="flex items-center gap-2 text-xs font-bold text-[#536471] hover:text-[#0F1419] disabled:opacity-30 transition-colors bg-[#EFF3F4] px-4 py-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
                  Undo
               </button>
               <button (click)="service.resetMatch(match.id)" class="flex items-center gap-2 text-xs font-bold text-[#536471] hover:text-red-600 transition-colors bg-[#EFF3F4] px-4 py-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"/></svg>
                  Reset
               </button>
            </div>
          </div>
          <div class="h-2 bg-[#F7F9F9] border-b border-[#EFF3F4]"></div>
        } @else {
           <!-- New Match Creator -->
           <div class="p-4 border-b border-[#EFF3F4]">
              <div class="border border-[#EFF3F4] rounded-2xl p-4">
                <h3 class="font-bold text-[#0F1419] mb-4 text-lg">New Match</h3>
                <div class="flex flex-col gap-3">
                   <div class="relative">
                     <select [(ngModel)]="selectedTeamA" class="w-full bg-[#F7F9F9] rounded-lg p-3 text-[15px] font-medium outline-none border border-transparent focus:bg-white focus:ring-1 focus:ring-[#0F1419] appearance-none">
                        <option [ngValue]="null">Select Team A (Black)</option>
                        @for (team of service.teams(); track team.id) {
                          <option [ngValue]="team.id">Team {{team.id}} ({{team.players[0].name}} & {{team.players[1].name}})</option>
                        }
                     </select>
                     <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#536471]">▼</div>
                   </div>
                   
                   <div class="relative">
                     <select [(ngModel)]="selectedTeamB" class="w-full bg-[#F7F9F9] rounded-lg p-3 text-[15px] font-medium outline-none border border-transparent focus:bg-white focus:ring-1 focus:ring-[#0F1419] appearance-none">
                        <option [ngValue]="null">Select Team B (White)</option>
                        @for (team of service.teams(); track team.id) {
                          @if(team.id !== selectedTeamA) {
                             <option [ngValue]="team.id">Team {{team.id}} ({{team.players[0].name}} & {{team.players[1].name}})</option>
                          }
                        }
                     </select>
                     <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#536471]">▼</div>
                   </div>

                   <button (click)="startMatch()" [disabled]="!canStartMatch()" class="bg-[#0F1419] text-white p-3 rounded-full font-bold mt-2 hover:bg-black disabled:opacity-50 transition-colors shadow-sm">Start Match</button>
                </div>
              </div>
           </div>
           <div class="h-2 bg-[#F7F9F9] border-b border-[#EFF3F4]"></div>
        }

        <!-- Match History Feed -->
        <div class="flex flex-col gap-0">
           @for (match of sortedMatches(); track match.id) {
             <div class="p-4 border-b border-[#EFF3F4] hover:bg-[#F7F9F9] transition-colors cursor-pointer group">
                <div class="flex justify-between items-center mb-2">
                   <div class="flex items-center gap-2">
                     <div class="w-8 h-8 rounded-full bg-[#EFF3F4] flex items-center justify-center text-[#536471]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 14.14 14.14"/></svg>
                     </div>
                     <span class="font-bold text-[#536471] text-sm">Match Result</span>
                     <span class="text-[#536471]">·</span>
                     <span class="text-[#536471] text-sm">{{ match.status === 'active' ? 'Live' : 'Final' }}</span>
                   </div>
                   @if(match.status === 'active') {
                     <button (click)="service.activeMatchId.set(match.id)" class="text-xs font-bold text-white bg-[#0F1419] px-3 py-1 rounded-full hover:opacity-90">Resume</button>
                   }
                </div>
                
                <div class="pl-10">
                  <div class="flex items-center justify-between py-1">
                     <div class="font-bold text-[#0F1419] text-[15px]">{{ getTeamNames(match.teamAId) }}</div>
                     <div class="font-bold text-[#0F1419] text-[15px]" [class.text-[#536471]]="match.scoreA < match.scoreB">{{ match.scoreA }}</div>
                  </div>

                  <div class="flex items-center justify-between py-1">
                     <div class="font-bold text-[#0F1419] text-[15px]">{{ getTeamNames(match.teamBId) }}</div>
                     <div class="font-bold text-[#0F1419] text-[15px]" [class.text-[#536471]]="match.scoreB < match.scoreA">{{ match.scoreB }}</div>
                  </div>
                </div>
             </div>
           } @empty {
             <div class="py-12 text-center text-[#536471] text-sm">No matches yet.</div>
           }
        </div>
      </div>
    </div>
  `
})
export class MatchesComponent {
  service = inject(GameService);
  selectedTeamA: number | null = null;
  selectedTeamB: number | null = null;
  lastScored = signal<'A' | 'B' | null>(null);

  sortedMatches = computed(() => {
    return this.service.matches().sort((a, b) => b.startTime - a.startTime);
  });

  canStartMatch() {
    return this.selectedTeamA && this.selectedTeamB && (this.selectedTeamA !== this.selectedTeamB);
  }

  startMatch() {
    if (this.canStartMatch()) {
      this.service.startMatch(this.selectedTeamA!, this.selectedTeamB!);
      this.selectedTeamA = null;
      this.selectedTeamB = null;
    }
  }

  onScore(matchId: number, teamId: number, side: 'A' | 'B') {
    this.service.scorePoint(matchId, teamId);
    this.lastScored.set(side);
    // 200ms duration for effect
    setTimeout(() => { this.lastScored.set(null); }, 200);
  }

  getTeamNames(teamId: number): string {
    const team = this.service.teams().find(t => t.id === teamId);
    if (!team) return `Team ${teamId}`;
    return `${team.players[0].name} & ${team.players[1].name}`;
  }
}