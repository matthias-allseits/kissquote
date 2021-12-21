import {Component, OnInit} from '@angular/core';
import {TranslationService} from '../../services/translation.service';
import {PortfolioService} from '../../services/portfolio.service';
import {Portfolio} from '../../models/portfolio';

@Component({
    selector: 'app-session-restore',
    templateUrl: './session-restore.component.html',
    styleUrls: ['./session-restore.component.scss']
})
export class SessionRestoreComponent implements OnInit {

    public key;

    constructor(
        public tranService: TranslationService,
        private portfolioService: PortfolioService,
    ) {
    }

    ngOnInit(): void {
    }

    public submitKey(): void {
        console.log(this.key);
        this.portfolioService.portfolioByKey(this.key)
            .subscribe(returnedPortfolio => {
                console.log(returnedPortfolio);
                if (returnedPortfolio instanceof Portfolio) {
                    localStorage.setItem('my-key', returnedPortfolio.hashKey);
                    document.location.href = '/my-dashboard';
                } else {
                    alert('Something went wrong!');
                }
            });
    }

}
