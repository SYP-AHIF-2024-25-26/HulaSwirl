import {Component, inject, signal} from '@angular/core';
import {NgIf} from '@angular/common';
import {Ingredient, IngredientsService} from '../ingredients.service';
import {firstValueFrom, single} from 'rxjs';
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
  C_newIngredients=signal<Ingredient[]>([]);
  C_newLiquidAmount=signal('0');
  allAvailableIngredients=signal<Ingredient[]>([]);
  C_newIngredientName=signal('Choose Ingredient');


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
    this.C_closeModal();
  }

  async C_Order() {
    try {
      await this.ingredientService.postOrder(this.C_newIngredients().map((ingredient) => {
        return {
          Name: ingredient.name,
          Amount: ingredient.remainingMl
        }
      }));
    } catch (e) {
      // console.error(e);
    }
  }

  async ngOnInit(){
    this.allAvailableIngredients.set(await this.ingredientService.getAllIngredients());
    this.C_newIngredients.set(await this.ingredientService.getAllIngredients());//kommt nacher weg
  }
}
