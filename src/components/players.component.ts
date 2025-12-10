import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService, Strength } from '../services/game.service';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pb-8">
      <!-- Sticky Header -->
      <div class="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-[#EFF3F4] cursor-pointer">
         <div class="h-safe w-full"></div>
         <div class="px-4 py-3 flex items-center justify-between">
            <div>
               <h2 class="text-xl font-bold text-[#0F1419] leading-none">Players</h2>
               <div class="text-xs text-[#536471] mt-0.5">{{ service.players().length }} active players</div>
            </div>
         </div>
      </div>

      <div class="p-4">
        <!-- Add Player Box -->
        <div class="flex gap-3 mb-6">
           <div class="w-12 h-12 rounded-full bg-[#EFF3F4] shrink-0 flex items-center justify-center text-[#536471]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
           </div>
           
           <div class="flex-grow">
               <input 
                 type="text" 
                 [(ngModel)]="newName"
                 (keyup.enter)="add()" 
                 placeholder="Name (or leave empty for random)" 
                 class="w-full bg-transparent outline-none text-xl placeholder:text-[#536471] pt-2 pb-4 text-[#0F1419]"
               />
               <div class="flex items-center justify-between border-t border-[#EFF3F4] pt-3">
                  <div class="flex items-center gap-2">
                     <div class="relative group">
                       <select [(ngModel)]="newStrength" class="appearance-none bg-transparent text-sm font-bold text-[#0F1419] outline-none cursor-pointer hover:bg-[#EFF3F4] rounded-full px-3 py-1 transition-colors pr-8">
                          <option value="pro">Pro</option>
                          <option value="medium">Medium</option>
                          <option value="noob">Noob</option>
                       </select>
                       <div class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[#0F1419]"><path d="m6 9 6 6 6-6"/></svg>
                       </div>
                     </div>
                  </div>

                  <button 
                    (click)="add()" 
                    class="bg-[#0F1419] hover:bg-black text-white px-5 py-2 rounded-full font-bold text-sm transition-all shadow-sm active:scale-95"
                  >
                    {{ newName() ? 'Add' : 'Random' }}
                  </button>
               </div>
           </div>
        </div>

        <div class="h-2 bg-[#F7F9F9] -mx-4 border-y border-[#EFF3F4]"></div>

        <!-- Search Bar -->
        <div class="mt-4 mb-2 relative group">
           <div class="absolute left-3 top-1/2 -translate-y-1/2 text-[#536471]">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
           </div>
           <input 
             type="text" 
             [(ngModel)]="searchQuery"
             placeholder="Search players..." 
             class="w-full bg-[#EFF3F4] text-[#0F1419] text-[15px] rounded-full py-2.5 pl-10 pr-10 outline-none border border-transparent focus:bg-white focus:border-[#0F1419] focus:ring-1 focus:ring-[#0F1419] transition-all placeholder:text-[#536471]"
           />
           @if (searchQuery()) {
             <button (click)="searchQuery.set('')" class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#536471] hover:bg-[#CFD9DE] hover:text-[#0F1419] rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
             </button>
           }
        </div>

        <!-- List -->
        <div class="flex flex-col">
          @for (player of filteredPlayers(); track player.id) {
            <div class="group py-4 px-4 hover:bg-[#EFF3F4] transition-colors flex justify-between items-center cursor-pointer -mx-4 border-b border-[#EFF3F4]">
               <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-black text-white">
                     {{ player.name.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="font-bold text-[#0F1419] text-[15px] hover:underline leading-tight">{{ player.name }}</div>
                    <div class="text-[13px] text-[#536471] leading-tight">@pickle_{{player.id}} · <span class="uppercase font-bold text-[11px]">{{ player.strength }}</span></div>
                  </div>
               </div>
               
               <button 
                (click)="service.deletePlayer(player.id); $event.stopPropagation()"
                class="w-8 h-8 flex items-center justify-center rounded-full text-[#536471] hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
               </button>
            </div>
          } @empty {
             <div class="text-center py-12 text-[#536471]">
                @if (searchQuery()) {
                  <p>No players found matching "{{searchQuery()}}"</p>
                } @else {
                  <p>No players found.</p>
                }
             </div>
          }
        </div>
      </div>
    </div>
  `
})
export class PlayersComponent {
  service = inject(GameService);
  newName = signal('');
  newStrength = signal<Strength>('medium');
  searchQuery = signal('');

  filteredPlayers = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const players = this.service.players();
    if (!query) return players;
    return players.filter(p => p.name.toLowerCase().includes(query));
  });

  private randomNames = [
    "Pickle Rick", "Dink Master", "Net Ninja", "Smash King", 
    "Volley Vixen", "Kitchen Dweller", "Paddle Pro", "Spin Doctor", 
    "Baseline Boss", "Serve Ace", "Drop Shot Diva", "Lob Star",
    "Ball Banger", "Court Jester", "Rally Rogue", "Ace Ventura",
    "Third Shot Terror", "Side Out Sid", "Zero Zero Two", "Falafel Phil"
  ];

  add() {
    let name = this.newName().trim();
    
    if (!name) {
      name = this.randomNames[Math.floor(Math.random() * this.randomNames.length)];
    }

    this.service.addPlayer(name, this.newStrength());
    this.newName.set('');
    this.newStrength.set('medium');
  }
}