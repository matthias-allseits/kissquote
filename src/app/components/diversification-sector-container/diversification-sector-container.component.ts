import {Component, Input} from '@angular/core';
import {Portfolio} from "../../models/portfolio";
import {TranslationService} from "../../services/translation.service";
import {PortfolioService} from "../../services/portfolio.service";
import {ShareheadService} from "../../services/sharehead.service";
import {ShareheadShare} from "../../models/sharehead-share";
import {Position} from "../../models/position";
import {Observable, Subscriber} from "rxjs";


@Component({
  selector: 'app-diversification-sector-container',
  templateUrl: './diversification-sector-container.component.html',
  styleUrls: ['./diversification-sector-container.component.scss']
})
export class DiversificationSectorContainerComponent {

    @Input() portfolio?: Portfolio;

    public timeWarpMode = false;
    public timeWarpTitle = '';
    public timeWarpDate?: Date;
    public timeWarpedPortfolio?: Portfolio;

    constructor(
        public tranService: TranslationService,
        public portfolioService: PortfolioService,
        private shareheadService: ShareheadService,
    ) {
    }

    startTimeWarp(months: number): void {
        if (months < 13) {
            this.timeWarpTitle = `${months} months ago`;
        } else {
            this.timeWarpTitle = `${months / 12} years ago`;
        }
        this.timeWarpDate = new Date();
        this.timeWarpDate.setMonth(this.timeWarpDate.getMonth() - months);
        this.timeWarpMode = true;
        if (this.portfolio) {
            const myKey = localStorage.getItem('my-key');
            this.portfolioService.portfolioByKeyAndDate(myKey, this.timeWarpDate)
                .subscribe(portfolio => {
                    this.timeWarpedPortfolio = portfolio;
                    this.loadShareheadShares()
                        .subscribe(result => {
                            if (this.timeWarpedPortfolio) {
                                this.timeWarpedPortfolio.shareheadSharesLoaded = true;
                                // console.log(this.timeWarpedPortfolio);
                            }
                        });
                });
        }
    }

    stopTimeWarp(): void {
        this.timeWarpMode = false;
        this.timeWarpedPortfolio = undefined;
    }


    // todo: move this to a service since this is not dry
    private loadShareheadShares(): Observable<boolean>
    {
        return new Observable(psitons => {
            let result = false;
            if (this.timeWarpedPortfolio) {
                const allPositions = this.timeWarpedPortfolio.getAllPositions();
                // console.log('all posis length: ' + allPositions.length);
                const shareheadIds: number[] = [];
                const allActiveNonCash = this.timeWarpedPortfolio.getActiveNonCashPositions();
                allActiveNonCash.forEach(position => {
                    if (position.shareheadId) {
                        shareheadIds.push(position.shareheadId);
                    }
                });
                this.shareheadService.getSharesCollection(shareheadIds)
                    .subscribe(shares => {
                        this.assignShareheadShares(allPositions, shares, result, psitons);
                    });
                if (allActiveNonCash.length === 0) {
                    psitons.next(result);
                }
            }
        });
    }

    private assignShareheadShares(allPositions: Position[], shares: ShareheadShare[], result: boolean, psitons: Subscriber<boolean>) {
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
    }

}
