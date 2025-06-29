import { Injectable, inject } from '@angular/core';
import { ModalService, ModalType } from './modal.service';
import { signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FpsService {
  private readonly modalService = inject(ModalService);

  lowEndDetected = signal(false);
  fps = signal(60);
  private stabilized = signal(false);

  private isVisible = signal(true);
  private stabilizationTimer: number | null = null;
  private isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  constructor() {
    this.startMeasureLoop();

    document.addEventListener('visibilitychange', () => this.resetStabilization());
    window.addEventListener('pageshow', event => this.resetStabilization());

    effect(() => {
      if (
        !this.lowEndDetected() &&
        this.stabilized() &&
        this.isVisible() &&
        this.fps() < 25
      ) {
        this.lowEndDetected.set(true);
        this.modalService.openModal(ModalType.Status, {
          message: 'Your device seems to be running on low performance. '
            + 'Some features may not work as expected. '
            + 'If you think this is a mistake, please reload the page.'
        });
      }
    });
  }

  private startMeasureLoop() {
    let last = performance.now(), frames = 0;
    const step = (now: number) => {
      if (this.isVisible()) {
        frames++;
        if (now - last >= 1000) {
          this.fps.set(frames);
          frames = 0;
          last = now;
        }
      } else {
        last = now;
        frames = 0;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  private resetStabilization() {
    const nowVisible = document.visibilityState === 'visible';
    this.isVisible.set(nowVisible);

    if (this.stabilizationTimer != null) {
      clearTimeout(this.stabilizationTimer);
    }

    this.lowEndDetected.set(false);
    this.stabilized.set(false);
    this.fps.set(60);

    if (nowVisible) {
      const delay = this.isMobile ? 5000 : 2500;
      this.stabilizationTimer = window.setTimeout(() => {
        this.stabilizationTimer = null;
        this.stabilized.set(true);
      }, delay);
    }
  }
}
