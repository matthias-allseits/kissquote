import {Component, Input, OnInit} from '@angular/core';
import {TranslationService} from "../../services/translation.service";
import {DividendTotals, Portfolio} from "../../models/portfolio";
import {ChartData} from "chart.js";
import {BankAccount} from "../../models/bank-account";

@Component({
  selector: 'app-dashboard-balance',
  templateUrl: './dashboard-balance.component.html',
  styleUrls: ['./dashboard-balance.component.scss']
})
export class DashboardBalanceComponent implements OnInit {

    @Input() portfolio?: Portfolio;
    @Input() dividendLists?: DividendTotals[];

    public incomeChartDataImproved?: ChartData;
    public incomeChartDataImprovedBoxHeight = 143;

    constructor(
        public tranService: TranslationService,
    ) {
    }

    ngOnInit() {
        if (screen.width < 400) {
            this.incomeChartDataImprovedBoxHeight = 300;
        }
        this.incomeChartDataImproved = this.portfolio?.incomeChartDataImproved();
    }

    getBalanceChartDataByAccount(account: BankAccount): ChartData {
        return {
            labels: [ 'Kontogebühren vs Einnahmen' ],
            datasets: [
                {
                    label: 'Kontogebühren',
                    data: [account.getAccountFeesTotal()]
                },
                {
                    label: 'Einnahmen',
                    data: [account.getEarningsTotal()]
                },
            ]
        };
    }

}
