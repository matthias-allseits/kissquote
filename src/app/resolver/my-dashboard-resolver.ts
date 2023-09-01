import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {ShareheadService} from "../services/sharehead.service";
import {Portfolio} from "../models/portfolio";
import {PortfolioService} from "../services/portfolio.service";


@Injectable({
  providedIn: 'root'
})
export class MyDashboardResolver implements Resolve<Portfolio>{

    private portfolio?: Portfolio;

    constructor(
        private portfolioService: PortfolioService,
        private shareheadService: ShareheadService,
    ) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Portfolio> {
        return new Observable(holder => {
            const myKey = localStorage.getItem('my-key');
            console.log('myKey in resolver: ', myKey);
            if (null !== myKey) {
                // let us get the portfolio again with all its interesting data
                this.portfolioService.portfolioByKey(myKey)
                    .subscribe(returnedPortfolio => {
                        if (returnedPortfolio instanceof Portfolio) {
                            this.portfolio = returnedPortfolio;
                            this.portfolio.calculatePositionsShareFromTotal();

                            this.loadShareheadShares()
                                .subscribe(result => {
                                    holder.next(this.portfolio);
                                });
                        } else {
                            alert('Something went wrong!');
                            // todo: redirect back to landingpage. probably the solution: implement guards
                        }
                    });
            } else {
                // todo: redirect back to landingpage. probably the solution: implement guards
            }
        });
    }


    private loadShareheadShares(): Observable<boolean>
    {
        return new Observable(psitons => {
            let result = false;
            if (this.portfolio) {
                const allPositions = this.portfolio.getAllPositions();
                // console.log('all posis length: ' + allPositions.length);
                this.shareheadService.getSharesCollection(this.portfolio)
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
