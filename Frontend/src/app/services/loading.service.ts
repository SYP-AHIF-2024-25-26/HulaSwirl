import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private pending = signal(0);
  readonly isLoading = computed(() => this.pending() > 0);

  start(): void {
    this.pending.set(this.pending() + 1);
  }

  stop(): void {
    const val = this.pending();
    if (val > 0) {
      this.pending.set(val - 1);
    }
  }
}
