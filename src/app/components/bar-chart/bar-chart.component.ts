import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {BaseChartDirective} from "ng2-charts";
import {ChartConfiguration, ChartData, ChartDataset, ChartEvent, ChartType} from "chart.js";


@Component({
    selector: 'app-bar-chart',
    templateUrl: './bar-chart.component.html',
    styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnInit {

    @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
    @Input() data?: ChartDataset[];


    public barChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        // We use these empty structures as placeholders for dynamic theming.
        scales: {
            x: {},
            y: {
                min: 10
            }
        },
        plugins: {
            legend: {
                display: true,
            },
            // datalabels: {
            //     anchor: 'end',
            //     align: 'end'
            // }
        }
    };
    public barChartType: ChartType = 'bar';
    // public barChartPlugins = [
    //     DataLabelsPlugin
    // ];

    public barChartData: ChartData = {
        labels: [ 'Kosten vs Einnahmen' ],
        datasets: []
    };

    constructor() {
    }

    ngOnInit(): void {
        if (this.data) {
            this.barChartData.datasets = this.data;
        }
    }

    // events
    public chartClicked({ event, active }: { event?: ChartEvent, active?: {}[] }): void {
        // console.log(event, active);
    }

    public chartHovered({ event, active }: { event?: ChartEvent, active?: {}[] }): void {
        // console.log(event, active);
    }

}
