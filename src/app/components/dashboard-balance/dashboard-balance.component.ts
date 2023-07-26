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
                // console.log('length: ' + allPositions.length);
                let counter = 0;
                // todo: use a shares-collection endpoint from sharehead to reduce number of requests
                allPositions.forEach((position, index) => {
                    if (position.shareheadId !== undefined && position.shareheadId > 0 && position.active) {
                        this.shareheadService.getTimeWarpedShare(position.shareheadId, timeWarpDate)
                            .subscribe(share => {
                                if (share) {
                                    position.shareheadShare = share;
                                }
                                counter++;
                                // console.log(counter);
                                if (counter == allPositions.length) {
                                    result = true;
                                    psitons.next(result);
                                }
                            });
                    } else {
                        counter++;
                        // console.log(counter);
                    }
                });
            }
        });
    }

}
