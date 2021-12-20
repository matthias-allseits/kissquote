import {Component, OnInit} from '@angular/core';
import {TranslationService} from '../../services/translation.service';
import {PortfolioService} from '../../services/portfolio.service';
import {Portfolio} from '../../models/portfolio';


@Component({
    selector: 'app-upload-alternative',
    templateUrl: './upload-alternative.component.html',
    styleUrls: ['./upload-alternative.component.scss']
})

export class UploadAlternativeComponent implements OnInit {

    constructor(
        public tranService: TranslationService,
        public portfolioService: PortfolioService
    ) {
    }

    ngOnInit(): void {
    }

    createPortfolio(): void
    {
        const portfolio = new Portfolio(null, null, null, null);
        this.portfolioService.create(portfolio)
            .subscribe(response => {
                 console.log(response);
            });
    }

}
