import { Component } from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-order-drink-modal',
    imports: [
        NgForOf,
        NgIf
    ],
  templateUrl: './order-drink-modal.component.html',
  styleUrl: './order-drink-modal.component.css'
})
export class OrderDrinkModalComponent {

}
