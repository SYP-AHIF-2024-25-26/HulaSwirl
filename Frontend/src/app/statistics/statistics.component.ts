import {Component, effect, inject, OnInit, signal} from '@angular/core';
import {NgForOf, DatePipe} from '@angular/common';
import {StatisticsService} from '../services/statistics.service';

@Component({
  selector: 'app-statistics',
  imports: [NgForOf, DatePipe],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css'
})
export class StatisticsComponent implements OnInit {
  private readonly statisticsService = inject(StatisticsService);

  drinks = this.statisticsService.drinkStats;
  users = this.statisticsService.userStats;
  ingredients = this.statisticsService.ingredientStats;
  intervals = this.statisticsService.intervalStats;

  ngOnInit(): void {
    this.statisticsService.loadAll();
  }

  maxInterval() {
    return Math.max(...this.intervals().map(i => i.count), 1);
  }

  barHeight(count: number): string {
    return (count / this.maxInterval() * 100) + '%';
  }
}
