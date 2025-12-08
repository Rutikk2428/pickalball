import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayersComponent } from './components/players.component';
import { TeamsComponent } from './components/teams.component';
import { MatchesComponent } from './components/matches.component';
import { GameService } from './services/game.service';

type View = 'players' | 'teams' | 'matches';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, PlayersComponent, TeamsComponent, MatchesComponent],
  template: `
    <div class="flex h-screen bg-white text-[#0F1419] justify-center overflow-hidden">
      
      <!-- DESKTOP LEFT SIDEBAR -->
      <header class="hidden md:flex flex-col items-end w-20 xl:w-72 shrink-0 h-full p-2 overflow-y-auto custom-scrollbar">
        <div class="w-full max-w-[275px] flex flex-col h-full px-2">
          <!-- Logo -->
          <div class="p-3 mb-2">
             <div class="w-12 h-12 rounded-full hover:bg-[#EFF3F4] flex items-center justify-center text-black transition-colors cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m14.31 8 5.74 9.94"/><path d="M9.69 8h11.48"/></svg>
             </div>
          </div>

          <!-- Nav Links -->
          <nav class="flex flex-col gap-1 text-xl">
            <button 
              (click)="currentView.set('players')"
              class="flex items-center gap-4 p-3 rounded-full hover:bg-[#EFF3F4] transition-all group w-fit xl:w-full"
            >
              <div class="relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [class.stroke-[2.5]]="currentView() === 'players'"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" x2="20" y1="8" y2="14"/><line x1="23" x2="17" y1="11" y2="11"/></svg>
              </div>
              <span class="hidden xl:block" [class.font-bold]="currentView() === 'players'" [class.font-medium]="currentView() !== 'players'">Players</span>
            </button>

            <button 
              (click)="currentView.set('teams')"
              class="flex items-center gap-4 p-3 rounded-full hover:bg-[#EFF3F4] transition-all group w-fit xl:w-full"
            >
              <div class="relative">
                 <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [class.stroke-[2.5]]="currentView() === 'teams'"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
              </div>
              <span class="hidden xl:block" [class.font-bold]="currentView() === 'teams'" [class.font-medium]="currentView() !== 'teams'">Teams</span>
            </button>

            <button 
              (click)="currentView.set('matches')"
              class="flex items-center gap-4 p-3 rounded-full hover:bg-[#EFF3F4] transition-all group w-fit xl:w-full"
            >
              <div class="relative">
                 <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [class.stroke-[2.5]]="currentView() === 'matches'"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 14.14 14.14"/></svg>
              </div>
              <span class="hidden xl:block" [class.font-bold]="currentView() === 'matches'" [class.font-medium]="currentView() !== 'matches'">Matches</span>
            </button>
          </nav>

          <!-- Action Button -->
          <div class="mt-8 w-fit xl:w-full">
            <button 
              (click)="currentView.set('matches')"
              class="w-12 h-12 xl:w-full xl:h-12 bg-[#0F1419] text-white rounded-full font-bold text-lg shadow hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="xl:hidden"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
               <span class="hidden xl:block">Play Now</span>
            </button>
          </div>
          
          <div class="mt-auto mb-4 p-3 rounded-full hover:bg-[#EFF3F4] flex items-center gap-3 cursor-pointer transition-colors w-fit xl:w-full">
             <div class="w-10 h-10 rounded-full bg-[#0F1419] flex items-center justify-center text-white font-bold">U</div>
             <div class="hidden xl:block">
               <div class="font-bold text-sm text-[#0F1419]">User</div>
               <div class="text-[#536471] text-xs">@pickleballer</div>
             </div>
             <div class="hidden xl:block ml-auto text-[#0F1419]">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
             </div>
          </div>
        </div>
      </header>

      <!-- CENTER FEED -->
      <main class="flex-grow w-full max-w-[600px] border-x border-[#EFF3F4] h-full flex flex-col relative bg-white">
        <!-- Top Mobile Header -->
        <div class="md:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#EFF3F4] px-4 py-3 flex items-center justify-between">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-black">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m14.31 8 5.74 9.94"/><path d="M9.69 8h11.48"/></svg>
            </div>
            <span class="font-bold text-lg text-black">PickleScore</span>
            <div class="w-8"></div>
        </div>

        <div class="flex-grow overflow-y-auto overflow-x-hidden hide-scrollbar">
           @switch (currentView()) {
             @case ('players') { <app-players class="block animate-fade-in min-h-full" /> }
             @case ('teams') { <app-teams class="block animate-fade-in min-h-full" /> }
             @case ('matches') { <app-matches class="block animate-fade-in min-h-full" /> }
           }
        </div>
        
        <!-- Mobile Bottom Tab Bar -->
        <div class="md:hidden border-t border-[#EFF3F4] bg-white grid grid-cols-3 p-2 shrink-0 pb-safe z-50">
            <button (click)="currentView.set('players')" class="flex flex-col items-center justify-center p-2 rounded-xl transition-colors" [class.text-black]="currentView() === 'players'" [class.text-[#536471]]="currentView() !== 'players'">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" x2="20" y1="8" y2="14"/><line x1="23" x2="17" y1="11" y2="11"/></svg>
            </button>
            <button (click)="currentView.set('teams')" class="flex flex-col items-center justify-center p-2 rounded-xl transition-colors" [class.text-black]="currentView() === 'teams'" [class.text-[#536471]]="currentView() !== 'teams'">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
            </button>
            <button (click)="currentView.set('matches')" class="flex flex-col items-center justify-center p-2 rounded-xl transition-colors" [class.text-black]="currentView() === 'matches'" [class.text-[#536471]]="currentView() !== 'matches'">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 14.14 14.14"/></svg>
            </button>
        </div>
      </main>

      <!-- RIGHT SIDEBAR (WIDGETS) -->
      <aside class="hidden lg:block w-[350px] shrink-0 p-4 h-full overflow-y-auto pl-8">
         <!-- Search Mock -->
         <div class="bg-[#EFF3F4] rounded-full p-3 flex items-center gap-3 mb-4 focus-within:bg-white focus-within:ring-1 ring-[#0F1419] border border-transparent focus-within:border-[#0F1419] transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[#536471] ml-2"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
            <input type="text" placeholder="Search" class="bg-transparent outline-none text-sm font-medium w-full text-[#0F1419] placeholder:text-[#536471]">
         </div>

         <!-- Widget: Top Players -->
         <div class="bg-[#F7F9F9] rounded-2xl p-4 mb-4">
            <h3 class="font-black text-xl mb-4 text-[#0F1419]">Who to watch</h3>
            <div class="flex flex-col gap-4">
              @for (player of topPlayers(); track player.id) {
                 <div class="flex items-center justify-between cursor-pointer hover:bg-[#EFF3F4] -mx-2 p-2 rounded-lg transition-colors">
                    <div class="flex items-center gap-3">
                       <div class="w-10 h-10 rounded-full bg-white border border-[#EFF3F4] flex items-center justify-center font-bold text-black">
                         {{ player.name.charAt(0) }}
                       </div>
                       <div>
                         <div class="font-bold text-sm text-[#0F1419] hover:underline">{{ player.name }}</div>
                         <div class="text-[12px] uppercase font-bold text-[#536471]">{{ player.strength }}</div>
                       </div>
                    </div>
                    <button class="bg-[#0F1419] text-white text-xs font-bold px-4 py-1.5 rounded-full hover:bg-black transition-colors">Follow</button>
                 </div>
              } @empty {
                <div class="text-sm text-[#536471]">No players yet.</div>
              }
            </div>
            <div class="mt-4 text-[#0F1419] text-sm font-normal cursor-pointer hover:underline">
              Show more
            </div>
         </div>

         <!-- Widget: Footer -->
         <div class="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[#536471] px-2 leading-tight">
           <a href="#" class="hover:underline">Terms of Service</a>
           <a href="#" class="hover:underline">Privacy Policy</a>
           <a href="#" class="hover:underline">Cookie Policy</a>
           <a href="#" class="hover:underline">Accessibility</a>
           <span>© 2024 PickleScore</span>
         </div>
      </aside>

    </div>

    <style>
      .hide-scrollbar::-webkit-scrollbar { display: none; }
      .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
      .animate-fade-in { animation: fadeIn 0.3s ease-out; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    </style>
  `
})
export class AppComponent {
  currentView = signal<View>('players');
  service = inject(GameService);

  topPlayers = computed(() => {
     return this.service.players().slice(0, 4);
  });
}