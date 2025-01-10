import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Observable, Subscriber} from "rxjs";
import {ShareheadService} from "../services/sharehead.service";
import {Portfolio} from "../models/portfolio";
import {PortfolioService} from "../services/portfolio.service";
import {Position} from "../models/position";
import {ShareheadShare} from "../models/sharehead-share";


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
            // console.log('myKey in resolver: ', myKey);
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
                const shareheadIds: number[] = [];
                const allActiveNonCash = this.portfolio.getActiveNonCashPositions();
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
        for (const position of allPositions) {
            if (position.shareheadId !== undefined && position.shareheadId > 0 && position.active) {
                shares.forEach(share => {
                    if (share.id === position.shareheadId) {
                        position.shareheadShare = share;
                    }
                });
            }
        }
        psitons.next(result);
    }
}
