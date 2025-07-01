import {Component, effect, inject, OnInit, signal, WritableSignal} from '@angular/core';
import {NgForOf, DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {BaseChartDirective} from 'ng2-charts';
import {ChartConfiguration, ChartData, ChartOptions, ChartType} from 'chart.js';
import {StatisticsService} from '../services/statistics.service';

@Component({
  selector: 'app-statistics',
  imports: [NgForOf, FormsModule, BaseChartDirective],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css'
})
export class StatisticsComponent implements OnInit {
  private readonly statisticsService = inject(StatisticsService);

  drinks = this.statisticsService.drinkStats;
  users = this.statisticsService.userStats;
  ingredients = this.statisticsService.ingredientStats;
  intervals = this.statisticsService.intervalStats;

  start: string = '';
  end: string = '';

  drinkChartData: WritableSignal<ChartData<'pie'>> = signal({datasets: [], labels: []});
  ingredientChartData: WritableSignal<ChartData<'pie'>> = signal({datasets: [], labels: []});
  intervalChartData: WritableSignal<ChartData<'bar'>> = signal({datasets: [{data: []}], labels: []});
  intervalChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const count = ctx.parsed.y as number;
            return ` ${count} drinks at ${ctx.label}`;
          }
        }
      }
    }
  };

  drinkAmounts: number[] = [];
  ingredientCounts: number[] = [];

  drinkChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const count = ctx.parsed as number;
            const amount = this.drinkAmounts[ctx.dataIndex];
            return ` ${count} ${ctx.label} (${amount} ml)`;
          }
        }
      }
    }
  };

  ingredientChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const amount = ctx.parsed as number;
            const count = this.ingredientCounts[ctx.dataIndex];
            return ` ${count} ${ctx.label} (${amount} ml)`;
          }
        }
      }
    }
  };

  constructor() {
    effect(() => {
      this.buildDrinkChart();
      this.buildIngredientChart();
      this.buildIntervalChart();
    });
  }

  async ngOnInit() {
    await this.statisticsService.loadAll();
  }

  async reload() {
    await this.statisticsService.loadAll(this.start, this.end);
  }

  private buildDrinkChart() {
    const data = [...this.drinks()].sort((a,b) => b.count - a.count);
    const top = data.slice(0,5);
    const others = data.slice(5);
    const otherCount = others.reduce((sum,d) => sum + d.count, 0);
    const otherAmount = others.reduce((sum,d) => sum + d.totalAmount, 0);

    const labels = top.map(d => d.drinkName);
    const counts = top.map(d => d.count);
    this.drinkAmounts = top.map(d => d.totalAmount);
    if (others.length) {
      labels.push('Others');
      counts.push(otherCount);
      this.drinkAmounts.push(otherAmount);
    }

    this.drinkChartData.set({labels, datasets: [{data: counts}]});
  }

  private buildIngredientChart() {
    const data = [...this.ingredients()].sort((a,b) => b.totalAmount - a.totalAmount);
    const top = data.slice(0,5);
    const others = data.slice(5);
    const otherAmounts = others.reduce((s,i)=>s+i.totalAmount,0);
    const otherCounts = others.reduce((s,i)=>s+i.usageCount,0);

    const labels = top.map(i=>i.ingredientName);
    const amounts = top.map(i=>i.totalAmount);
    this.ingredientCounts = top.map(i=>i.usageCount);
    if(others.length){
      labels.push('Others');
      amounts.push(otherAmounts);
      this.ingredientCounts.push(otherCounts);
    }

    this.ingredientChartData.set({labels, datasets:[{data: amounts}]});
  }

  private buildIntervalChart() {
    const labels = this.intervals().map(i=>new Date(i.intervalStart).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}));
    const data = this.intervals().map(i=>i.count);
    this.intervalChartData.set({labels, datasets:[{
      data,
      label: 'Orders',
      backgroundColor: '#ff811a',
    }]});
  }
}
