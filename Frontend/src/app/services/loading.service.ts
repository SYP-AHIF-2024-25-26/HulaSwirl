import { Injectable, signal, computed } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingCount = 0;
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public readonly isLoading$: Observable<boolean> = this.loadingSubject.asObservable();

  start(): void {
    this.loadingCount++;
    if (this.loadingCount === 1) {
      this.loadingSubject.next(true);
    }
  }

  stop(): void {
    if (this.loadingCount > 0) {
      this.loadingCount--;
    }
    if (this.loadingCount === 0) {
      this.loadingSubject.next(false);
    }
  }
}
