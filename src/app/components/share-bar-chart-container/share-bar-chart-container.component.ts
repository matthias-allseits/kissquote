import {Component, Input, OnInit} from '@angular/core';
import {StockRate} from "../../models/stock-rate";
import {Position} from "../../models/position";


@Component({
  selector: 'app-share-bar-chart-container',
  templateUrl: './share-bar-chart-container.component.html',
  styleUrls: ['./share-bar-chart-container.component.scss']
})
export class ShareBarChartContainerComponent implements OnInit {

    @Input() historicRates?: StockRate[];
    @Input() position?: Position;

    public chartTab = 'weeks';

    ngOnInit(): void {
        const storedChartTab = localStorage.getItem('positionChartTab');
        if (storedChartTab) {
            this.chartTab = storedChartTab;
        } else {
            this.chartTab = 'weeks';
            localStorage.setItem('positionChartTab', 'weeks');
        }
    }

    changeChartTab(selectedTab: string): void {
        this.chartTab = selectedTab;
        localStorage.setItem('positionChartTab', selectedTab);
    }

}
