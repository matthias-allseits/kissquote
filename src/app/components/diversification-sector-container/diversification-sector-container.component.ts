import {Component, Input} from '@angular/core';
import {Portfolio} from "../../models/portfolio";
import {TranslationService} from "../../services/translation.service";
import {PortfolioService} from "../../services/portfolio.service";


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
    ) {
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
                });
        }
    }

    stopTimeWarp(): void {
        this.timeWarpMode = false;
        this.timeWarpedPortfolio = undefined;
    }

}