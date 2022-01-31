import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ChartConfiguration, ChartData, ChartEvent, ChartType} from "chart.js";
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
        labels: []
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
        }
    };

    constructor() {
    }

    ngOnInit(): void {
        if (this.data) {
            this.lineChartData = this.data;
        }
    }

    private static generateNumber(i: number): number {
        return Math.floor((Math.random() * (i < 2 ? 100 : 1000)) + 1);
    }

    public randomize(): void {
        for (let i = 0; i < this.lineChartData.datasets.length; i++) {
            for (let j = 0; j < this.lineChartData.datasets[i].data.length; j++) {
                this.lineChartData.datasets[i].data[j] = LineChartComponent.generateNumber(i);
            }
        }
        this.chart?.update();
    }

    // events
    public chartClicked({event, active}: { event?: ChartEvent, active?: {}[] }): void {
        // console.log(event, active);
    }

    public chartHovered({event, active}: { event?: ChartEvent, active?: {}[] }): void {
        // console.log(event, active);
    }

    public hideOne(): void {
        const isHidden = this.chart?.isDatasetHidden(1);
        this.chart?.hideDataset(1, !isHidden);
    }

    public pushOne(): void {
        this.lineChartData.datasets.forEach((x, i) => {
            const num = LineChartComponent.generateNumber(i);
            x.data.push(num);
        });
        this.lineChartData?.labels?.push(`Label ${this.lineChartData.labels.length}`);

        this.chart?.update();
    }

    public changeColor(): void {
        this.lineChartData.datasets[2].borderColor = 'green';
        this.lineChartData.datasets[2].backgroundColor = `rgba(0, 255, 0, 0.3)`;

        this.chart?.update();
    }

    public changeLabel(): void {
        if (this.lineChartData.labels) {
            this.lineChartData.labels[2] = ['1st Line', '2nd Line'];
        }

        this.chart?.update();
    }

}
