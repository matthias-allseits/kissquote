import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ChartConfiguration, ChartData, ChartEvent, ChartOptions, ChartType} from "chart.js";
import {BaseChartDirective} from "ng2-charts";


@Component({
    selector: 'app-line-chart',
    templateUrl: './line-chart.component.html',
    styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnInit {

    @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
    @Input() data?: ChartData;
    public lineChartType: ChartType = 'line';

    public lineChartData: ChartConfiguration['data'] = {
        datasets: [],
        labels: [],
    };

    public lineChartOptions: ChartConfiguration['options'] = {
        elements: {
            line: {
                // tension: 0.5
            }
        },
        scales: {
            // We use this empty structure as a placeholder for dynamic theming.
            x: {},
            'y-axis-0':
                {
                    position: 'left',
                },
        },
        plugins: {
            legend: {display: true},
        },
    };

    constructor() {
    }

    ngOnInit(): void {
        if (this.data) {
            this.lineChartData = this.data;
        }
    }

    // events
    public chartClicked({event, active}: { event?: ChartEvent, active?: {}[] }): void {
        // console.log(event, active);
    }

    public chartHovered({event, active}: { event?: ChartEvent, active?: {}[] }): void {
        // console.log(event, active);
    }

}
