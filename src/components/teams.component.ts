import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pb-8">
      <!-- Sticky Header -->
      <div class="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-[#EFF3F4]">
         <div class="h-safe w-full"></div>
         <div class="px-4 py-3 flex items-center justify-between">
            <h2 class="text-xl font-bold text-[#0F1419]">Teams</h2>
            <div class="flex items-center gap-2">
              @if (service.teams().length > 0) {
                 <button 
                  (click)="toggleSwapMode()"
                  class="px-4 py-1.5 rounded-full font-bold text-xs transition-all border"
                  [class.bg-[#0F1419]]="isSwapMode()"
                  [class.text-white]="isSwapMode()"
                  [class.bg-white]="!isSwapMode()"
                  [class.text-[#0F1419]]="!isSwapMode()"
                  [class.border-[#0F1419]]="!isSwapMode()"
                  [class.border-transparent]="isSwapMode()"
                >
                  {{ isSwapMode() ? 'Done' : 'Swap' }}
                </button>
              }
              <button 
                (click)="service.generateTeams()"
                [disabled]="isSwapMode()"
                class="bg-[#0F1419] hover:bg-black text-white px-4 py-1.5 rounded-full font-bold text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Generate
              </button>
            </div>
         </div>
         @if(isSwapMode()) {
           <div class="bg-[#F7F9F9] px-4 py-2 text-center text-xs text-[#536471] font-medium border-b border-[#EFF3F4] animate-fade-in">
             Drag players to swap teams (or tap two players).
           </div>
         }
      </div>

      <div class="p-0 flex flex-col">
        
        <!-- Teams List -->
        <div class="grid grid-cols-1 divide-y divide-[#EFF3F4]">
          @if (service.players().length < 2) {
             <div class="p-12 text-center text-[#536471]">
                <div class="text-lg font-bold mb-2">Build your roster</div>
                <p>You need at least 2 players to generate teams.</p>
             </div>
          }

          @for (team of service.teams(); track team.id) {
            <div class="bg-white p-4 transition-colors relative">
               <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-1 text-[#536471] text-xs font-bold uppercase">
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                     Team {{ $index + 1 }}
                  </div>
               </div>
               
               <div class="flex items-center gap-3">
                  <!-- Player 1 -->
                  <div 
                    (click)="onPlayerClick(team.players[0].id)"
                    [attr.draggable]="isSwapMode() ? true : null"
                    (dragstart)="onDragStart($event, team.players[0].id)"
                    (dragover)="onDragOver($event)"
                    (dragenter)="onDragEnter($event, team.players[0].id)"
                    (drop)="onDrop($event, team.players[0].id)"
                    (dragend)="onDragEnd($event)"
                    class="flex-1 flex items-center gap-3 border rounded-xl p-3 bg-white transition-all duration-200 select-none"
                    [class.cursor-grab]="isSwapMode()"
                    [class.active:cursor-grabbing]="isSwapMode()"
                    [class.hover:bg-[#F7F9F9]]="isSwapMode() && draggedPlayerId() !== team.players[0].id"
                    [class.border-[#0F1419]]="selectedPlayerId() === team.players[0].id || dragOverPlayerId() === team.players[0].id"
                    [class.border-[#EFF3F4]]="selectedPlayerId() !== team.players[0].id && dragOverPlayerId() !== team.players[0].id"
                    [class.ring-2]="selectedPlayerId() === team.players[0].id || dragOverPlayerId() === team.players[0].id"
                    [class.ring-[#0F1419]]="selectedPlayerId() === team.players[0].id || dragOverPlayerId() === team.players[0].id"
                    [class.scale-[1.02]]="selectedPlayerId() === team.players[0].id || dragOverPlayerId() === team.players[0].id"
                    [class.opacity-40]="draggedPlayerId() === team.players[0].id"
                  >
                     <div class="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shrink-0">{{ team.players[0].name.charAt(0) }}</div>
                     <span class="font-bold text-sm text-[#0F1419] truncate">{{ team.players[0].name }}</span>
                     @if(isSwapMode()) {
                       <div class="ml-auto text-[#CFD9DE]">
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                       </div>
                     }
                  </div>

                  <div class="text-[#CFD9DE] shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
                  </div>
                  
                  <!-- Player 2 -->
                  <div 
                    (click)="onPlayerClick(team.players[1].id)"
                    [attr.draggable]="isSwapMode() ? true : null"
                    (dragstart)="onDragStart($event, team.players[1].id)"
                    (dragover)="onDragOver($event)"
                    (dragenter)="onDragEnter($event, team.players[1].id)"
                    (drop)="onDrop($event, team.players[1].id)"
                    (dragend)="onDragEnd($event)"
                    class="flex-1 flex items-center gap-3 border rounded-xl p-3 bg-white justify-end transition-all duration-200 select-none"
                    [class.cursor-grab]="isSwapMode()"
                    [class.active:cursor-grabbing]="isSwapMode()"
                    [class.hover:bg-[#F7F9F9]]="isSwapMode() && draggedPlayerId() !== team.players[1].id"
                    [class.border-[#0F1419]]="selectedPlayerId() === team.players[1].id || dragOverPlayerId() === team.players[1].id"
                    [class.border-[#EFF3F4]]="selectedPlayerId() !== team.players[1].id && dragOverPlayerId() !== team.players[1].id"
                    [class.ring-2]="selectedPlayerId() === team.players[1].id || dragOverPlayerId() === team.players[1].id"
                    [class.ring-[#0F1419]]="selectedPlayerId() === team.players[1].id || dragOverPlayerId() === team.players[1].id"
                    [class.scale-[1.02]]="selectedPlayerId() === team.players[1].id || dragOverPlayerId() === team.players[1].id"
                    [class.opacity-40]="draggedPlayerId() === team.players[1].id"
                  >
                     @if(isSwapMode()) {
                       <div class="mr-auto text-[#CFD9DE]">
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                       </div>
                     }
                     <span class="font-bold text-sm text-[#0F1419] truncate">{{ team.players[1].name }}</span>
                     <div class="w-8 h-8 rounded-full bg-white border border-black text-black flex items-center justify-center font-bold text-xs shrink-0">{{ team.players[1].name.charAt(0) }}</div>
                  </div>
               </div>
            </div>
          } @empty {
             @if (service.players().length >= 2) {
               <div class="py-12 text-center text-[#536471]">
                 Click Generate to create new matchups.
               </div>
             }
          }
        </div>

        <div class="h-2 bg-[#F7F9F9] border-y border-[#EFF3F4]"></div>

        <!-- Leaderboard -->
        @if (service.teams().length > 0) {
          <div class="mt-0">
             <h3 class="font-black text-xl text-[#0F1419] px-4 py-3">Standings</h3>
             <div class="bg-white">
                @for (stat of standings(); track stat.team.id) {
                  <div class="flex items-center justify-between px-4 py-3 border-b border-[#EFF3F4] hover:bg-[#F7F9F9] transition-colors cursor-pointer">
                     <div class="flex items-center gap-4">
                        <div class="font-medium text-[#536471] w-4 text-center text-sm">{{ $index + 1 }}</div>
                        <div>
                           <div class="font-bold text-sm text-[#0F1419] hover:underline">{{ stat.team.players[0].name }} & {{ stat.team.players[1].name }}</div>
                           <div class="text-[13px] text-[#536471]">{{ stat.played }} played · {{ stat.diff > 0 ? '+' : ''}}{{ stat.diff }} diff</div>
                        </div>
                     </div>
                     <div class="text-[#0F1419] font-bold text-sm">
                        {{ stat.points }} pts
                     </div>
                  </div>
                }
             </div>
          </div>
        }

      </div>
    </div>
  `
})
export class TeamsComponent {
  service = inject(GameService);
  isSwapMode = signal(false);
  selectedPlayerId = signal<number | null>(null);
  
  // Drag State
  draggedPlayerId = signal<number | null>(null);
  dragOverPlayerId = signal<number | null>(null);

  standings = computed(() => {
    const teams = this.service.teams();
    const matches = this.service.matches().filter(m => m.status === 'completed');

    return teams.map(team => {
      let played = 0;
      let won = 0;
      let diff = 0;
      matches.forEach(match => {
        if (match.teamAId === team.id || match.teamBId === team.id) {
          played++;
          const isTeamA = match.teamAId === team.id;
          const myScore = isTeamA ? match.scoreA : match.scoreB;
          const oppScore = isTeamA ? match.scoreB : match.scoreA;
          diff += (myScore - oppScore);
          if (myScore > oppScore) won++;
        }
      });
      return { team, played, won, diff, points: (won * 2) };
    }).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.diff !== a.diff) return b.diff - a.diff;
      return b.won - a.won;
    });
  });

  toggleSwapMode() {
    this.isSwapMode.update(v => !v);
    this.selectedPlayerId.set(null);
    this.resetDragState();
  }

  onPlayerClick(playerId: number) {
    if (!this.isSwapMode()) return;

    const currentlySelected = this.selectedPlayerId();

    if (currentlySelected === null) {
      // Select first player
      this.selectedPlayerId.set(playerId);
    } else if (currentlySelected === playerId) {
      // Deselect if clicking same player
      this.selectedPlayerId.set(null);
    } else {
      // Perform swap
      this.service.swapPlayers(currentlySelected, playerId);
      this.selectedPlayerId.set(null);
    }
  }

  // --- Drag and Drop Handlers ---

  onDragStart(event: DragEvent, playerId: number) {
    if (!this.isSwapMode()) {
       event.preventDefault(); // Block drag if not in mode
       return;
    }
    
    this.draggedPlayerId.set(playerId);
    
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', playerId.toString());
    }
  }

  onDragOver(event: DragEvent) {
    // Only allow dropping if we are in swap mode and dragging something
    if (this.isSwapMode() && this.draggedPlayerId()) {
      event.preventDefault(); // Allows drop
      if (event.dataTransfer) {
         event.dataTransfer.dropEffect = 'move';
      }
    }
  }

  onDragEnter(event: DragEvent, targetId: number) {
    if (this.isSwapMode() && this.draggedPlayerId() && this.draggedPlayerId() !== targetId) {
       event.preventDefault();
       this.dragOverPlayerId.set(targetId);
    }
  }

  onDrop(event: DragEvent, targetId: number) {
    event.preventDefault();
    const sourceId = this.draggedPlayerId();
    
    if (sourceId && sourceId !== targetId) {
      this.service.swapPlayers(sourceId, targetId);
    }
    this.resetDragState();
  }

  onDragEnd(event: DragEvent) {
    this.resetDragState();
  }

  private resetDragState() {
    this.draggedPlayerId.set(null);
    this.dragOverPlayerId.set(null);
  }
}