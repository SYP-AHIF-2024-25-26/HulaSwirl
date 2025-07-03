import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-lazy-image',
  standalone: true,
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
