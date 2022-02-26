import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
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
    @Input() height = 141;

    public lineChartType: ChartType = 'line';
    public lineChartOptions: ChartConfiguration['options'] = {
        elements: {
            line: {
                // tension: 0.5
            },
            point: {
                radius: 0
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
            legend: {
                display: false
            },
        },
    };
    public lineChartData?: ChartData;

    constructor() {
    }

    ngOnInit(): void {
        if (this.data) {
            this.lineChartData = this.data;
        }
    }

    updateData(data: ChartData): void {
        console.log('let us update data');
        console.log(data);
        this.data = data;
        if (this.chart) {
            this.chart.update();
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
