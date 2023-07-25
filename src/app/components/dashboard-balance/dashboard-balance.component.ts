import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {TranslationService} from "../../services/translation.service";
import {DividendTotals, Portfolio} from "../../models/portfolio";
import {ChartData} from "chart.js";
import {BankAccount} from "../../models/bank-account";

export interface AccountBalance {
    account: BankAccount;
    chartData: ChartData;
}

@Component({
  selector: 'app-dashboard-balance',
  templateUrl: './dashboard-balance.component.html',
  styleUrls: ['./dashboard-balance.component.scss']
})
export class DashboardBalanceComponent implements OnInit, OnChanges {

    @Input() portfolio?: Portfolio;
    @Input() dividendLists?: DividendTotals[];

    public dividendIncomeChartData?: ChartData;
    public incomeChartDataImproved?: ChartData;
    public yieldChartData?: ChartData;
    public investmentChartData?: ChartData;
    public incomeChartDataImprovedBoxHeight = 143;
    public accountBalances: AccountBalance[] = [];

    constructor(
        public tranService: TranslationService,
    ) {
    }

    ngOnInit() {
        if (screen.width < 400) {
            this.incomeChartDataImprovedBoxHeight = 300;
        }
        this.incomeChartDataImproved = this.portfolio?.incomeChartDataImproved();
        if (this.portfolio) {
            this.portfolio.bankAccounts.forEach(account => {
                const data = this.getBalanceChartDataByAccount(account);
                this.accountBalances.push(
                    { account: account, chartData: data }
                );
            });
            this.investmentChartData = this.portfolio.investmentChartData();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.dividendIncomeChartData = this.portfolio?.dividendIncomeChartData();
        this.yieldChartData = this.portfolio?.yieldChartData();
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
