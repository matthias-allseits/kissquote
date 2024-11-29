import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {PositionService} from "../services/position.service";
import {Position} from "../models/position";
import {StockRate} from "../models/stock-rate";
import {StockRateCreator} from "../creators/stock-rate-creator";
import {ChartData} from "chart.js";
import {ShareheadService} from "../services/sharehead.service";
import {Label} from "../models/label";


export interface PositionData {
    position?: Position;
    historicRates?: StockRate[];
    costIncomeChartData?: ChartData;
}

@Injectable({
  providedIn: 'root'
})
export class PositionDetailResolver implements Resolve<PositionData>{

    constructor(
        private positionService: PositionService,
        private shareheadService: ShareheadService,
    ) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PositionData> {
        const positionId = route.params['id'];
        // console.log('positionId in resolver: ', positionId);

        return new Observable(holder => {
            let historicRates: StockRate[];
            this.positionService.getPosition(positionId)
                .subscribe(position => {
                    if (position) {
                        const data: PositionData = {
                            position: position,
                            historicRates: undefined,
                            costIncomeChartData: position.costIncomeChartdata()
                        }
                        if (position.isCash) {
                            holder.next(data);
                        }

                        // this.positionService.getOfflineStockRates(this.position.share, this.position.currency)
                        position.getStockRates()
                            .subscribe(rates => {
                                if (rates.length > 0) {
                                    this.addLatestRateToLineChart(position, rates);
                                    data.historicRates = rates;

                                    if (position.shareheadId && position.shareheadId > 0) {
                                        this.shareheadService.getShare(position.shareheadId)
                                            .subscribe(share => {
                                                if (share) {
                                                    position.shareheadShare = share;
                                                    holder.next(data);
                                                }
                                            });
                                    } else {
                                        holder.next(data);
                                    }
                                } else {
                                    data.historicRates = [];
                                    holder.next(data);
                                }
                            });
                        let ultimateFilter: Label[];
                        const filterFromStorage = localStorage.getItem('ultimateFilterLabel');
                        if (filterFromStorage) {
                            ultimateFilter = JSON.parse(filterFromStorage);
                            let checkedCounter = 0;
                            ultimateFilter?.forEach(lbl => {
                                if (lbl.checked) {
                                    checkedCounter++;
                                }
                            });
                            if (checkedCounter < 3) {
                                ultimateFilter?.forEach(lbl => {
                                    if (position.labels && lbl.checked) {
                                        position.labels.forEach(label => {
                                            if (lbl.id === label.id && lbl.checked) {
                                                label.checked = true;
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    }
                });
        });
    }

    private addLatestRateToLineChart(position: Position, rates: StockRate[]): void
    {
        if (position?.balance && position.balance.lastRate) {
            const lastRateFromBalance = position.balance.lastRate;
            if (lastRateFromBalance.date > rates[rates.length - 1].date && !this.areRatesEqual(lastRateFromBalance, rates[rates.length - 1])) {
                if (position) {
                    if (position.share?.marketplace?.currency === 'GBX') {
                        // island apes shit!
                        const ratesCopy = StockRateCreator.createNewStockRate();
                        ratesCopy.rate = lastRateFromBalance.rate * 100;
                        ratesCopy.high = lastRateFromBalance.high * 100;
                        ratesCopy.low = lastRateFromBalance.low * 100;
                        rates.push(ratesCopy);
                    } else {
                        if (position.share?.name && position.share?.name?.indexOf('BRC') > -1) {
                            if (lastRateFromBalance.low === 0) {
                                lastRateFromBalance.low = lastRateFromBalance.rate / 10;
                            }
                            if (lastRateFromBalance.high === 0) {
                                lastRateFromBalance.high = lastRateFromBalance.rate / 10;
                            }
                        }
                        rates.push(lastRateFromBalance);
                    }
                }
            }
        }
    }

    private areRatesEqual(rate1: StockRate, rate2: StockRate): boolean
    {
        return rate1.rate === rate2.rate && rate1.high === rate2.high;
    }

}
