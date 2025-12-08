import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService, Strength } from '../services/game.service';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pb-32">
      <!-- Sticky Header -->
      <div class="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-[#EFF3F4] px-4 py-3 cursor-pointer">
         <h2 class="text-xl font-bold text-[#0F1419]">Players</h2>
         <div class="text-xs text-[#536471]">{{ service.players().length }} active players</div>
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
                 placeholder="Name of new player?" 
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
                    [disabled]="!newName()"
                    class="bg-[#0F1419] hover:bg-black disabled:opacity-50 text-white px-5 py-2 rounded-full font-bold text-sm transition-all"
                  >
                    Add
                  </button>
               </div>
           </div>
        </div>

        <div class="h-2 bg-[#F7F9F9] -mx-4 border-y border-[#EFF3F4]"></div>

        <!-- List -->
        <div class="flex flex-col">
          @for (player of service.players(); track player.id) {
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
                <p>No players found.</p>
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

  add() {
    if (!this.newName()) return;
    this.service.addPlayer(this.newName(), this.newStrength());
    this.newName.set('');
    this.newStrength.set('medium');
  }
}