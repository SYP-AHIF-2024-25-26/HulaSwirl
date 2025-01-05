import {Component, inject,signal} from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import {Ingredient, IngredientsService} from '../ingredients.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-ingredients',
  imports: [CdkDropList, CdkDrag, FormsModule],
  templateUrl: './ingredients.component.html',
  standalone: true,
  styleUrl: './ingredients.component.css'
})
export class IngredientsComponent {
  private readonly ingredientsService = inject(IngredientsService);


  availableIngredients= signal< Ingredient[]>([]);
  notAvailableIngredients= signal<Ingredient[]>([]);

  async ngOnInit() {
    let allIngredients: Ingredient[] = await this.ingredientsService.getAllIngredients();
    allIngredients.forEach(ingredient => {
      ingredient.slot===0 ?
        this.notAvailableIngredients().push(ingredient)
        : this.availableIngredients().push(ingredient);
    });
    this.indexIngredients();
  }

  drop(event: CdkDragDrop<signal<Ingredient[]>, any>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  this.indexIngredients();
  }
  indexIngredients(){
    for (let i = 0; i < this.availableIngredients().length; i++) {
      this.availableIngredients()[i].slot=i+1;
    }
    for (let i = 0; i < this.notAvailableIngredients().length; i++) {
      this.notAvailableIngredients()[i].slot=0;
    }
    console.log(this.availableIngredients())
  }
}
