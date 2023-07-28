import {Component, OnInit} from '@angular/core';
import {TranslationService} from '../../services/translation.service';
import {PortfolioService} from '../../services/portfolio.service';
import {Portfolio} from '../../models/portfolio';
import {Router} from '@angular/router';


@Component({
    selector: 'app-import-alternative',
    templateUrl: './import-alternative.component.html',
    styleUrls: ['./import-alternative.component.scss']
})

export class ImportAlternativeComponent implements OnInit {

    constructor(
        public tranService: TranslationService,
        private portfolioService: PortfolioService,
        private router: Router,
    ) {
    }

    ngOnInit(): void {
    }

    createPortfolio(): void
    {
        const portfolio = new Portfolio(0, null, null, null, [], [], []);
        this.portfolioService.create(portfolio)
            .subscribe(returnedPortfolio => {
                console.log(returnedPortfolio);
                if (returnedPortfolio && null !== returnedPortfolio.hashKey) {
                    localStorage.setItem('my-key', returnedPortfolio.hashKey);
                }
                document.location.href = '/my-dashboard';
            });
    }

}
