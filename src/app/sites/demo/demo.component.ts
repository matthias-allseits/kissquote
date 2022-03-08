import {Component, OnInit} from '@angular/core';
import {TranslationService} from '../../services/translation.service';
import {Portfolio} from "../../models/portfolio";
import {PortfolioService} from "../../services/portfolio.service";

@Component({
    selector: 'app-demo',
    templateUrl: './demo.component.html',
    styleUrls: ['./demo.component.scss']
})
export class DemoComponent implements OnInit {

    constructor(
        public tranService: TranslationService,
        private portfolioService: PortfolioService,
    ) {
    }

    ngOnInit(): void {
    }


    public createDemoPortfolio(): void {
        this.portfolioService.portfolioForDemo()
            .subscribe(returnedPortfolio => {
                console.log(returnedPortfolio);
                if (returnedPortfolio instanceof Portfolio) {
                    if (null !== returnedPortfolio.hashKey) {
                        localStorage.setItem('my-key', returnedPortfolio.hashKey);
                    }
                    document.location.href = '/my-dashboard';
                } else {
                    alert('Something went wrong!');
                }
            });
    }

}
