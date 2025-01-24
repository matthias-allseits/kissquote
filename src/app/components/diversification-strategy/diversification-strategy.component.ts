import {Component, Input, OnInit, SimpleChanges} from '@angular/core';
import {ChartData} from "chart.js";
import {Portfolio} from "../../models/portfolio";
import {Position} from "../../models/position";
import {GridColumn, GridContextMenuItem} from "../data-grid/data-grid.component";
import {TranslationService} from "../../services/translation.service";


@Component({
  selector: 'app-diversification-strategy',
  templateUrl: './diversification-strategy.component.html',
  styleUrls: ['./diversification-strategy.component.scss']
})
export class DiversificationStrategyComponent implements OnInit {

    @Input() portfolio?: Portfolio;
    @Input() timeWarpMode?: boolean;
    @Input() timeWarpDate?: Date|undefined;
    @Input() componentTitle?: string;

    public strategiesByInvestmentChartData?: ChartData;
    public strategiesByValueChartData?: ChartData;
    public strategiesByDividendChartData?: ChartData;
    public strategyColumns?: GridColumn[];
    public strategyContextMenu?: GridContextMenuItem[];
    public strategyListTitle = '';
    public strategyList: Position[] = [];

    constructor(
        public tranService: TranslationService,
    ) {
    }

    ngOnInit() {
        this.setStrategyGridOptions();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.loadData();
    }

    loadData() {
        if (this.portfolio) {
            this.strategiesByInvestmentChartData = this.portfolio.strategiesByInvestmentChartData();
            this.strategiesByValueChartData = this.portfolio.strategiesByValueChartData();
            this.strategiesByDividendChartData = this.portfolio.strategiesByDividendChartData();
        }
    }

    listStrategyPositions(event: any): void {
        this.strategyList = [];
        this.strategyListTitle = event;
        const filteredIds: number[] = [];
        this.portfolio?.getActiveNonCashPositions().forEach(position => {
            if (position.strategy?.name === event) {
                if (this.timeWarpMode) {
                    position.timeWarpDate = this.timeWarpDate;
                }
                this.strategyList.push(position);
                filteredIds.push(position.id);
            }
        });
        if (!this.timeWarpMode) {
            this.strategyList.sort((a, b) => (+a.totalReturnPerDay() < +b.totalReturnPerDay()) ? 1 : ((+b.totalReturnPerDay() < +a.totalReturnPerDay()) ? -1 : 0));
        } else {
            this.strategyList.sort((a, b) => (+a.activeFrom > +b.activeFrom) ? 1 : ((+b.activeFrom > +a.activeFrom) ? -1 : 0));
        }
        localStorage.setItem('ultimateFilterStrategy', JSON.stringify(filteredIds));
        localStorage.setItem('ultimateFilterType', 'strategy');
        localStorage.setItem('ultimateFilterValue', event);
    }


    selectPosition(position: Position) {
    }

    positionEventHandler(event: any) {
        switch(event.key) {
        }
    }

    private setStrategyGridOptions() {
        this.strategyColumns = [];
        this.strategyColumns.push(
            {
                title: this.tranService.trans('GLOB_SHARE'),
                type: 'string',
                field: 'share.name',
            },
            {
                title: 'Labels',
                type: 'renderer',
                field: 'labels',
                responsive: 'md-up',
                renderer: 'LabelsCellRendererComponent'
            },
            {
                title: 'Investment',
                type: 'number',
                format: '1.0',
                field: 'balance.investment',
                alignment: 'right',
                responsive: 'md-up',
                sortable: true
            },
            {
                title: this.tranService.trans('GLOB_VALUE'),
                type: 'function',
                format: '1.0',
                field: 'actualValue',
                alignment: 'right',
                responsive: 'sm-up',
                sortable: true
            },
            {
                title: 'Dividend',
                type: 'function',
                format: '1.0',
                field: 'bestSelectedDividendPayment',
                alignment: 'right',
                sortable: true
            },
            {
                title: this.tranService.trans('GLOB_CURRENCY'),
                type: 'string',
                field: 'currency.name',
            },
            {
                title: this.tranService.trans('LISTNGS_DAYS'),
                type: 'function',
                format: '1.0',
                field: 'daysSinceStart',
                alignment: 'right',
                responsive: 'sm-up',
                sortable: true
            },
            {
                title: 'Trpd',
                type: 'function',
                field: 'totalReturnPerDay',
                alignment: 'right',
                toolTip: 'Total return per day',
                responsive: 'sm-up',
                sortable: true,
                sorted: true
            }
        );

        if (this.timeWarpMode) {
            this.strategyColumns.splice(1, 1);
        }

        this.strategyContextMenu = [];
    }

}
