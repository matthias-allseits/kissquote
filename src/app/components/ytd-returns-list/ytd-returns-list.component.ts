import {Component, Input} from '@angular/core';
import {Portfolio, YtdReturnsSummary} from "../../models/portfolio";
import {DateHelper} from "../../core/datehelper";
import {TranslationService} from "../../services/translation.service";
import {GridColumn, GridContextMenuItem} from "../data-grid/data-grid.component";


@Component({
  selector: 'app-ytd-returns-list',
  templateUrl: './ytd-returns-list.component.html',
  styleUrls: ['./ytd-returns-list.component.scss']
})
export class YtdReturnsListComponent {

    @Input() portfolio?: Portfolio;

    public summaryActive = true;
    public ytdReturnsList?: YtdReturnsSummary[];
    public ytdReturnsTotal = 0;

    public returnColumns?: GridColumn[];
    public returnContextMenu?: GridContextMenuItem[];

    constructor(
        public tranService: TranslationService,
    ) {
    }

    ngOnInit() {
        const newYearsDay = new Date();
        newYearsDay.setMonth(0);
        newYearsDay.setDate(1);
        const dayOfYear = DateHelper.calculateSaysBetweenTwoDates(newYearsDay, new Date());
        if (dayOfYear > 14) {
            if (this.portfolio) {
                this.ytdReturnsList = this.portfolio.ytdReturnsSummary();
                this.ytdReturnsList.forEach(entry => {
                    this.ytdReturnsTotal += entry.ytdReturnSummary.returnTotal;
                });
            }
        } else {
            this.summaryActive = false;
        }
        this.setReturnGridOptions();
    }


    private setReturnGridOptions() {
        this.returnColumns = [];
        this.returnColumns.push(
            {
                title: this.tranService.trans('GLOB_SHARE'),
                type: 'string',
                field: 'position.share.name',
            },
            {
                title: 'Sector',
                type: 'string',
                field: 'position.sector.name',
                responsive: 'md-up',
            },
            {
                title: 'Start',
                type: 'number',
                format: '1.0',
                field: 'ytdReturnSummary.valueStart',
                alignment: 'right',
                sortable: true,
                sorted: false,
                responsive: 'md-up',
            },
            {
                title: 'Investments',
                type: 'number',
                format: '1.0',
                field: 'ytdReturnSummary.investments',
                alignment: 'right',
                sortable: true,
                sorted: false,
                responsive: 'sm-up',
            },
            {
                title: 'Current',
                type: 'number',
                format: '1.0',
                field: 'ytdReturnSummary.valueEnd',
                alignment: 'right',
                sortable: true,
                sorted: false,
                responsive: 'md-up',
            },
            {
                title: 'Dividends',
                type: 'number',
                format: '1.0',
                field: 'ytdReturnSummary.dividends',
                alignment: 'right',
                sortable: true,
                sorted: false,
                responsive: 'sm-up',
            },
            {
                title: 'Returns',
                type: 'number',
                format: '1.0',
                field: 'ytdReturnSummary.returnTotal',
                alignment: 'right',
                sortable: true,
                sorted: true
            }
        );

        this.returnContextMenu = [];
    }

}
