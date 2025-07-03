import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-async-image',
  standalone: true,
  imports: [NgIf],
  templateUrl: './async-image.component.html',
  styleUrl: './async-image.component.css'
})
export class AsyncImageComponent {
  @Input() src: string | null = null;
  @Input() alt = '';
  loaded = false;
}
