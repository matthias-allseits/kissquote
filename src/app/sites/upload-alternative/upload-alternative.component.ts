import {Component, OnInit} from '@angular/core';
import {TranslationService} from '../../services/translation.service';
import {PortfolioService} from '../../services/portfolio.service';
import {Portfolio} from '../../models/portfolio';
import {Router} from '@angular/router';


@Component({
    selector: 'app-upload-alternative',
    templateUrl: './upload-alternative.component.html',
    styleUrls: ['./upload-alternative.component.scss']
})

export class UploadAlternativeComponent implements OnInit {

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
        const portfolio = new Portfolio(null, null, null, null);
        this.portfolioService.create(portfolio)
            .subscribe(returnedPortfolio => {
                console.log(returnedPortfolio);
                localStorage.setItem('my-key', returnedPortfolio.hashKey);
                document.location.href = '/my-dashboard';
            });
    }

}
