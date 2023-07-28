import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {DividendTotals, Portfolio} from "../../models/portfolio";
import {TranslationService} from "../../services/translation.service";
import {ChartData} from "chart.js";
import {AccountBalance} from "../dashboard-balance/dashboard-balance.component";
import {BankAccount} from "../../models/bank-account";


@Component({
  selector: 'app-dashboard-balance-charts',
  templateUrl: './dashboard-balance-charts.component.html',
  styleUrls: ['./dashboard-balance-charts.component.scss']
})
export class DashboardBalanceChartsComponent implements OnInit, OnChanges {

    @Input() portfolio?: Portfolio;
    @Input() dividendLists?: DividendTotals[];
    @Input() timeWarpMode?: boolean;
    @Input() timeWarpDate?: Date|undefined;
    @Input() componentTitle?: string;

    public dividendIncomeChartData?: ChartData;
    public incomeChartDataImproved?: ChartData;
    public yieldChartData?: ChartData;
    public investmentChartData?: ChartData;
    public accountBalances: AccountBalance[] = [];

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
        if (this.portfolio) {
            this.portfolio.bankAccounts.forEach(account => {
                const data = this.getBalanceChartDataByAccount(account);
                this.accountBalances.push(
                    { account: account, chartData: data }
                );
            });
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.dividendIncomeChartData = this.portfolio?.dividendIncomeChartData();
        this.yieldChartData = this.portfolio?.yieldChartData();
        if (this.portfolio) {
            this.investmentChartData = this.portfolio.investmentChartData();
        }
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
