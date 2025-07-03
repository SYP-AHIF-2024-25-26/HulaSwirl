import {Component, Input} from '@angular/core';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-lazy-image',
  standalone: true,
  imports: [NgIf],
  templateUrl: './lazy-image.component.html',
  styleUrl: './lazy-image.component.css'
})
export class LazyImageComponent {
  @Input() src: string = '';
  @Input() alt: string = '';
  loaded = false;

  onLoad() {
    this.loaded = true;
  }
}
