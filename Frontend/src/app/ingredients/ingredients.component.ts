import {Component, inject, Signal, signal, WritableSignal} from '@angular/core';
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


  availableIngredients= signal<Ingredient[]>([]);
  notAvailableIngredients= signal<Ingredient[]>([]);

  async ngOnInit() {
    this.loadIngredients()
    this.indexIngredients();
  }

  drop(event: CdkDragDrop<WritableSignal<Ingredient[]>, any, any>) {
    const previousSignal = event.previousContainer.data as WritableSignal<Ingredient[]>;
    const currentSignal = event.container.data as WritableSignal<Ingredient[]>;

    if (event.previousContainer === event.container) {
      previousSignal.set(
        [...previousSignal()]
      );
      moveItemInArray(previousSignal(), event.previousIndex, event.currentIndex);
    } else {
      const prevArray = [...previousSignal()];
      const currArray = [...currentSignal()];

      transferArrayItem(prevArray, currArray, event.previousIndex, event.currentIndex);

      previousSignal.set(prevArray);
      currentSignal.set(currArray);
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
  }

  async loadIngredients(){
    let allIngredients: Ingredient[] = await this.ingredientsService.getAllIngredients();
    allIngredients.forEach(ingredient => {
      ingredient.slot===0 ?
        this.notAvailableIngredients().push(ingredient)
        : this.availableIngredients().push(ingredient);
    });
  }

  sumbit() {
    this.ingredientsService.saveIngredients(this.availableIngredients().concat(this.notAvailableIngredients()))
    console.log("Ingredients saved successfully.")
  }

  async cancel() {
    let oldAvailabeIngredients:Ingredient[]=[];
    let oldNotAvailabeIngredients:Ingredient[]=[];
    let allIngredients: Ingredient[] = await this.ingredientsService.getAllIngredients();
    allIngredients.forEach(ingredient => {
      ingredient.slot===0 ?
        oldNotAvailabeIngredients.push(ingredient)
        : oldAvailabeIngredients.push(ingredient);
    });


    console.log(oldAvailabeIngredients)
    this.availableIngredients.set(oldAvailabeIngredients);
    this.notAvailableIngredients.set(oldNotAvailabeIngredients);
    this.indexIngredients();
  }
}
