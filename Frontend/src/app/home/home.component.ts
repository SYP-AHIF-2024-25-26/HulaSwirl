import {Component, inject, signal} from '@angular/core';
import {NgIf} from '@angular/common';
import {Ingredient, IngredientsService} from '../ingredients.service';
import {single} from 'rxjs';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [
    NgIf,
    FormsModule
  ],
  templateUrl: './home.component.html',
  standalone: true,
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private readonly ingredientService=inject(IngredientsService);
  C_isModalOpen = false;
  C_ingredients=signal<Ingredient[]>([]);

  C_openModal() {
    this.C_isModalOpen = true;
  }
  C_closeModal() {
    this.C_isModalOpen = false;
  }
  C_onOverlayClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.C_closeModal();
    }
  }
  C_cancel() {

  }
  C_Order() {

  }

  async ngOnInit(){
    this.C_ingredients.set(await this.ingredientService.getAllIngredients());
    console.log(this.C_ingredients());
  }
}
