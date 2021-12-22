import {Component, OnInit} from '@angular/core';
import {Portfolio} from '../../models/portfolio';
import {PortfolioService} from '../../services/portfolio.service';


@Component({
    selector: 'app-my-dashboard',
    templateUrl: './my-dashboard.component.html',
    styleUrls: ['./my-dashboard.component.scss']
})
export class MyDashboardComponent implements OnInit {

    public myKey: string;
    public portfolio: Portfolio;

    constructor(
        private portfolioService: PortfolioService,
    ) {
    }

    ngOnInit(): void {
        this.myKey = localStorage.getItem('my-key');
        if (null !== this.myKey) {
            document.getElementById('dashboard-anchor').innerHTML = this.myKey;

            // let us get the portfolio again with all its interesting data
            this.portfolioService.portfolioByKey(this.myKey)
                .subscribe(returnedPortfolio => {
                    console.log(returnedPortfolio);
                    if (returnedPortfolio instanceof Portfolio) {
                        this.portfolio = returnedPortfolio;
                    } else {
                        alert('Something went wrong!');
                    }
                });
        } else {
            // todo: redirect back to landingpage
        }
    }

}
