import {Component, Input, OnInit} from '@angular/core';
import {TranslationService} from "../../services/translation.service";
import {DividendTotals, Portfolio} from "../../models/portfolio";
import {ChartData} from "chart.js";
import {BankAccount} from "../../models/bank-account";
import {PortfolioService} from "../../services/portfolio.service";
import {Observable} from "rxjs";
import {ShareheadService} from "../../services/sharehead.service";

export interface AccountBalance {
    account: BankAccount;
    chartData: ChartData;
}

@Component({
  selector: 'app-dashboard-balance',
  templateUrl: './dashboard-balance.component.html',
  styleUrls: ['./dashboard-balance.component.scss']
})
export class DashboardBalanceComponent implements OnInit {

    @Input() portfolio?: Portfolio;
    @Input() dividendLists?: DividendTotals[];

    public timeWarpMode = false;
    public timeWarpTitle = '';
    public timeWarpDate?: Date;
    public timeWarpedPortfolio?: Portfolio;
    public timeWarpedDividendLists?: DividendTotals[];

    constructor(
        public tranService: TranslationService,
        public portfolioService: PortfolioService,
        private shareheadService: ShareheadService,
    ) {
    }

    ngOnInit() {
    }


    startTimeWarp(months: number): void {
        this.timeWarpedDividendLists = undefined;
        this.timeWarpTitle = `${months} months ago`;
        this.timeWarpDate = new Date();
        this.timeWarpDate.setMonth(this.timeWarpDate.getMonth() - months);
        this.timeWarpMode = true;
        if (this.portfolio) {
            const myKey = localStorage.getItem('my-key');
            this.portfolioService.portfolioByKey(myKey)
                .subscribe(portfolio => {
                    this.timeWarpedPortfolio = portfolio;
                    if (this.timeWarpDate) {
                        this.loadShareheadShares(this.timeWarpDate)
                            .subscribe(result => {
                                if (this.timeWarpedPortfolio) {
                                    this.timeWarpedDividendLists = this.timeWarpedPortfolio.collectDividendLists();
                                }
                            });
                    }
                });
        }
    }

    stopTimeWarp(): void {
        this.timeWarpMode = false;
        this.timeWarpedPortfolio = undefined;
    }


    private loadShareheadShares(timeWarpDate: Date): Observable<boolean>
    {
        return new Observable(psitons => {
            let result = false;
            if (this.timeWarpedPortfolio) {
                const allPositions = this.timeWarpedPortfolio.getAllPositions();
                this.shareheadService.getTimeWarpedSharesCollection(this.timeWarpedPortfolio, timeWarpDate)
                    .subscribe(shares => {
                        let counter = 0;
                        allPositions.forEach((position, index) => {
                            if (position.shareheadId !== undefined && position.shareheadId > 0 && position.active) {
                                shares.forEach(share => {
                                    if (share.id === position.shareheadId) {
                                        position.shareheadShare = share;
                                        counter++;
                                    }
                                });
                            } else {
                                counter++;
                            }
                            // console.log(counter);
                            if (counter == allPositions.length) {
                                result = true;
                                // console.log('we are done');
                                psitons.next(result);
                            }
                        });
                    });
            }
        });
    }

}
