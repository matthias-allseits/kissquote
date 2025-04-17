import {Currency} from './currency';
import {Share} from './share';
import {Transaction} from "./transaction";
import {BankAccount} from "./bank-account";
import {Balance} from "./balance";
import {StockRate} from "./stock-rate";
import {Observable} from "rxjs";
import {ShareheadShare} from "./sharehead-share";
import {DividendProjection} from "./dividend-projection";
import {DividendProjectionCreator} from "../creators/dividend-projection-creator";
import {Forexhelper} from "../core/forexhelper";
import {ManualDividend} from "./manual-dividend";
import {ShareheadTurningPoint} from "./sharehead-turning-point";
import {Label} from "./label";
import {Sector} from "./sector";
import {PositionLog} from "./position-log";
import {SwissquoteHelper} from "../core/swissquote-helper";
import {Strategy} from "./strategy";
import {ChartData} from "chart.js";
import {DateHelper} from "../core/datehelper";
import {TargetSummary} from "../components/target-value/target-value.component";
import {ExtraPolaSummary} from "../components/extrapolation-list/extrapolation-list.component";
import {ShareheadPlannedDividend} from "./sharehead-planned-dividend";


export interface DividendTotal {
    positionId: number;
    name: string;
    total: number;
    totalNet: number;
    currency: Currency|null;
    source: string;
    transactionCount: number;
    manualDividend?: ManualDividend;
}

export interface MaxDrawdownSummary {
    postCoronaTop: ShareheadTurningPoint|undefined;
    postCoronaTopValue: number|undefined;
    maxDrawdown: number;
    maxDrawdownValue: number;
    method: string;
    lombardValue: number;
    lombardValueFromInvestment: number;
    lombardValueFromPostCoronaTop: number;
    risk: number;
}

export interface DividendDropSummary {
    maxDrop: number;
    maxDropValue: number;
    method: string;
    actualDividend: number;
    dividendAfterDrop: number;
}

export interface NextPayment {
    position: Position;
    positionId: number;
    payment: number;
    date: Date;
    currency: string;
    paymentCorrected?: number;
    currencyCorrected?: string;
}

export interface DividendDeclaration {
    position: Position;
    positionId: number;
    plannedDividend: ShareheadPlannedDividend;
}

export class Position {

    constructor(
        public id: number,
        public share: Share|null,
        public active: boolean,
        public activeFrom: Date|string,
        public activeUntil: Date|null|string,
        public transactions: Transaction[],
        public logEntries: PositionLog[],
        public isCash: boolean = false,
        public dividendPeriodicity: string,
        public shareFromTotal: number,
        public bankAccount?: BankAccount,
        public underlying?: Position,
        public removeUnderlying?: boolean,
        public motherId?: number,
        public sector?: Sector,
        public strategy?: Strategy,
        public currency?: Currency,
        public balance?: Balance,
        public shareheadId?: number,
        public stopLoss?: number,
        public targetPrice?: number,
        public targetType?: string,
        public manualDividend?: number,
        public manualTargetPrice?: number,
        public manualDrawdown?: number,
        public manualDividendDrop?: number,
        public manualDividendExDate?: Date|string,
        public manualDividendPayDate?: Date|string,
        public manualDividendAmount?: number,
        public labels?: Label[],
        public bankAccountName?: string,
        public shareheadShare?: ShareheadShare,
        public visible?: boolean, // for filtering purposes
        public tempPerformanceValue?: number, // for filtering purposes
        public timeWarpDate?: Date, // for time-warp purposes
    ) {}


    public getName(): string {
        if (this.share && this.share.name) {
            return this.share.name;
        } else if (this.currency && this.currency.name) {
            return this.currency.name;
        } else {
            return 'undefined';
        }
    }

    public getShortName(): string {
        if (this.share && this.share.shortname) {
            return this.share.shortname;
        } else if (this.currency && this.currency.name) {
            return this.currency.name;
        } else {
            return 'undefined';
        }
    }


    investmentBalance(): string
    {
        let result = 0;
        const actualValue = this.actualValue();
        if (this.balance && actualValue) {
            result = ((100 / this.balance.investment * +actualValue) - 100);
        }

        return result.toFixed(1);
    }


    realTransactions(): Transaction[]
    {
        const result: Transaction[] = [];
        for (const transaction of this.transactions) {
            if (transaction.isRealTransaction()) {
                result.push(transaction);
            }
        }

        return result;
    }


    stopLossWastage(): number
    {
        let result = 0;
        const actualValue = this.actualValue();
        if (this.balance && this.stopLoss && actualValue) {
            let stopLossResult = this.stopLoss * this.balance?.amount;
            if (this.currency && this.currency.name === 'GBP') { // yes, island-apes-shit, but here we keep it!
                (stopLossResult /= 100).toFixed(0);
            }
            result = +(stopLossResult - +actualValue).toFixed(0);
        }

        return result;
    }


    stopLossBroken(): boolean
    {
        let result = false;
        if (this.stopLoss && this.stopLoss > 0 && this.balance && this.balance.lastRate?.rate) {
            let stopLoss = this.stopLoss;
            if (this.balance.lastRate?.rate < stopLoss) {
                result = true;
            }
        }
        if (this.underlying?.stopLossBroken()) {
            result = true;
        }

        return result;
    }


    hasReachedTargetPrice(): boolean
    {
        let result = false;
        if (this.targetPrice && this.targetPrice > 0 && this.balance && this.balance.lastRate?.rate) {
            let targetPrice = this.targetPrice;
            if (
                (this.targetType === 'sell' && this.balance.lastRate?.rate > targetPrice) ||
                (this.targetType === 'buy' && this.balance.lastRate?.rate < targetPrice)
            ) {
                result = true;
            }
        }
        if (this.underlying?.hasReachedTargetPrice()) {
            result = true;
        }

        return result;
    }


    replaceTransaction(transaction: Transaction) {
        let index = 0;
        for (const transi of this.transactions) {
            if (transi.id === transaction.id) {
                this.transactions[index] = transaction;
            }
            index++;
        }
    }


    investmentAtDate(date: Date): number
    {
        let value = 0;
        this.transactions.forEach(transaction => {
            if (transaction.rate && transaction.date <= date) {
                if (transaction.title === 'Kauf') {
                    let transResult = (transaction.quantity * transaction.rate);
                    if (transaction.fee) {
                        transResult += transaction.fee;
                    }
                    value += transResult;
                } else if (transaction.title === 'Verkauf') {
                    let transResult = (transaction.quantity * transaction.rate);
                    if (transaction.fee) {
                        transResult -= transaction.fee;
                    }
                    value -= transResult;
                }
            }
        });

        return value;
    }


    payedDividendsTotalByYear(year: number): DividendTotal
    {
        let total = 0;
        let totalNet = 0;
        let transactionCount = 0;
        let currency = null;
        let lastTransactionDate: Date;

        this.transactions.forEach(transaction => {
            if (transaction.isDividend() && transaction.date instanceof Date && transaction.date.getFullYear() === year && transaction.rate) {
                total += transaction.rate;
                totalNet += transaction.netTotal();
                currency = transaction.currency;
                if (lastTransactionDate === undefined || transaction.date.getTime() !== lastTransactionDate.getTime()) {
                    transactionCount++;
                }
                lastTransactionDate = transaction.date;
            }
        });
        total = +total.toFixed(0);

        const manualDividend = this.share?.manualDividendByYear(year);

        const result = {
            positionId: this.id,
            name: this.getName(),
            total: total,
            totalNet: totalNet,
            currency: currency,
            source: '',
            transactionCount: transactionCount,
            manualDividend: manualDividend,
        };

        return result;
    }


    nextPayment(): NextPayment|undefined {
        let result;
        const shareheadShare = this.shareheadShare;
        const manualNextDividendPayment = this.manualNextDividendPayment();
        if (manualNextDividendPayment && this.manualDividendPayDate instanceof Date && this.currency?.name) {
            result = {
                position: this,
                positionId: this.id,
                payment: manualNextDividendPayment,
                date: this.manualDividendPayDate,
                currency: this.currency?.name,
                paymentCorrected: manualNextDividendPayment,
                currencyCorrected: this.currency?.name,
            };

            return result;
        }
        if (this.share && shareheadShare && shareheadShare.plannedDividends && shareheadShare.plannedDividends.length > 0) {
            if (shareheadShare.plannedDividends[0].amount > 0) {
                const nextPayDate = shareheadShare.plannedDividends[0].payDate;
                let nextPaymentCorrected;
                let nextPaymentCurrency = '';
                let nextPayment = 0;
                if (this.balance) {
                    nextPayment = nextPaymentCorrected = shareheadShare.plannedDividends[0].amount * this.balance?.amount;
                    if (shareheadShare.plannedDividends[0].currency) {
                        nextPaymentCurrency = shareheadShare.plannedDividends[0].currency.name;
                        if (this.currency?.name !== nextPaymentCurrency) {
                            nextPaymentCorrected = nextPayment * shareheadShare.plannedDividends[0].currency.rate;
                            if (this.currency && this.currency?.name !== 'CHF') {
                                nextPaymentCorrected = nextPaymentCorrected / this.currency.rate;
                            }
                        }
                    }
                }
                result = {
                    position: this,
                    positionId: this.id,
                    payment: nextPayment,
                    date: nextPayDate,
                    currency: nextPaymentCurrency,
                    paymentCorrected: nextPaymentCorrected,
                    currencyCorrected: this.currency?.name,
                };
            }
        }

        return result;
    }


    plannedDividendsTotalByYear(year: number): DividendTotal
    {
        let total = 0;
        let totalNet = 0;
        let currency = null;
        let source = 'From last payment(s)';

        if (this.balance && this.currency) {
            total = this.balance.projectedNextDividendPayment;
            currency = this.currency;
        }
        // todo: implement another method, that delivers the correct payment for this year considering the amount-changing-transactions
        const shareheadSharePayment = this.shareheadDividendPaymentCorrected();
        let projectedDividend = null;
        let lastProjectedDividend = null;
        if (year > new Date().getFullYear()) {
            const yearObject = new Date(new Date().setFullYear(year));
            projectedDividend = this.generateProjection(yearObject);
            if (projectedDividend === null) {
                const yearObject = new Date(new Date().setFullYear(year - 1));
                lastProjectedDividend = this.generateProjection(yearObject);
            }
        }

        const manualDividend = this.share?.manualDividendByYear(year);

        if (manualDividend && manualDividend.amount !== undefined) {
            source = 'From manual dividend entry';
            total = +manualDividend.amount;
        } else if (projectedDividend) {
            total = 0;
            if (projectedDividend.currencyCorrectedProjectionValue !== undefined) {
                source = 'From sharehead estimations (currency-corrected)';
                total += projectedDividend.currencyCorrectedProjectionValue;
            } else {
                source = 'From sharehead estimations';
                total += projectedDividend.projectionValue;
            }
        } else if (lastProjectedDividend && lastProjectedDividend.projectionValue > 0) {
            total = 0;
            if (lastProjectedDividend.currencyCorrectedProjectionValue !== undefined) {
                source = 'From estimations ' + (year - 1) + ' (currency-corrected)';
                total += lastProjectedDividend.currencyCorrectedProjectionValue;
            } else {
                source = 'From estimations ' + (year - 1);
                total += lastProjectedDividend.projectionValue;
            }
        } else if (+shareheadSharePayment > 0) {
            total = +shareheadSharePayment;
            source = 'From sharehead';
        }

        const result = {
            positionId: this.id,
            name: this.getName(),
            total: total,
            totalNet: totalNet,
            currency: currency,
            source: source,
            transactionCount: 0,
            manualDividend: manualDividend
        };

        return result;
    }


    isDividendRelevant(): boolean {
        let result = false;
        this.transactions.forEach(transaction => {
            if (transaction.isDividend()) {
                result = true;
            }
        });

        return result;
    }


    yieldOnInvestent(): string
    {
        let result = 0;
        if (this.balance) {
            result = (100 / this.balance.investment * this.balance.projectedNextDividendPayment);
        }

        return result.toFixed(1);
    }


    daysSinceStart(): number
    {
        let currentDate = new Date();
        if (this.timeWarpDate) {
            currentDate = this.timeWarpDate
        }

        if (this.activeFrom instanceof Date) {
            // yes i know, not every day has 24 hours. i do not care...
            return Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(this.activeFrom.getFullYear(), this.activeFrom.getMonth(), this.activeFrom.getDate()) ) /(1000 * 60 * 60 * 24));
        }

        return 1;
    }


    daysTillEnd(): number
    {
        let currentDate = new Date();

        if (this.activeUntil instanceof Date) {
            // yes i know, not every day has 24 hours. i do not care...
            return Math.floor((Date.UTC(this.activeUntil.getFullYear(), this.activeUntil.getMonth(), this.activeUntil.getDate()) - Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) ) /(1000 * 60 * 60 * 24));
        }

        return 1;
    }


    totalReturnPerDay(): string
    {
        if (this.balance && this.balance.lastRate) {
            return ((((this.balance.amount * this.balance.lastRate.rate) - this.balance.investment) + this.balance?.collectedDividends) / this.daysSinceStart()).toFixed(1);
        }

        return '0.0';
    }


    public quantityTotal(): number {
        let quantity = 0;
        let ignoreNext = false;
        this.transactions.forEach((transaction, i) => {
            if (!ignoreNext) {
                if (transaction.title === 'Kauf' || transaction.title === 'Verkauf') {
                    quantity += transaction.quantity;
                } else if (transaction.title === 'Split') {
                    const splitRatio = transaction.quantity / this.transactions[i + 1].quantity;
                    quantity *= splitRatio;
                    ignoreNext = true;
                }
            } else {
                ignoreNext = false;
            }
        });

        return quantity;
    }


    public cashValuation(): number {
        let value = 0;
        this.transactions.forEach(transaction => {
            if (transaction.rate) {
                value += transaction.quantity * transaction.rate;
            }
        });

        return value;
    }


    public actualValue(): string {
        if (!this.isCash) {
            if (this.balance && this.balance.lastRate) {
                return (this.balance.amount * this.balance.lastRate.rate).toFixed(0)
            }
        } else {
            if (this.balance && this.balance.cashValue !== undefined) {
                return this.balance?.cashValue.toFixed(2);
            }
        }

        return '';
    }


    isRelevant(): boolean {
        let cap = 5000;
        let relevanceLimit = localStorage.getItem('relevanceLimit');
        if (relevanceLimit) {
            cap = +relevanceLimit;
        }
        if (this.balance?.investment && +this.balance?.investment > cap || +this.actualValue() > cap) {
            return true;
        } else {
            return false;
        }
    }


    public valueFromMostOptimisticAnalyst(): number {
        let result = 0;
        if (this.shareheadShare) {
            const mostOptimisticRating = this.shareheadShare.mostOptimisticRating();
            if (this.balance && mostOptimisticRating && mostOptimisticRating.priceTarget) {
                result = this.balance.amount * mostOptimisticRating?.priceTarget;
            }
        }

        return result;
    }


    public getTargetSummary(): TargetSummary {
        let method = 'none';
        let methodShort = 'none';
        let actual = +this.actualValue();
        let target = +this.actualValue();
        let actualPrice = 0;
        if (this.balance?.lastRate) {
            actualPrice = this.balance?.lastRate.rate;
        }
        let targetPrice = 0;
        const targetFromMostOptimistic = this.valueFromMostOptimisticAnalyst();
        const mostOptimisticRating = this.shareheadShare?.mostOptimisticRating();
        if (this.manualTargetPrice && this.balance) {
            target = this.balance?.amount * this.manualTargetPrice;
            targetPrice = this.manualTargetPrice;
            method = `from manual entry`;
            methodShort = `from manual entry`;
        } else if (mostOptimisticRating && this.shareheadShare) {
            target = targetFromMostOptimistic;
            if (mostOptimisticRating?.date && mostOptimisticRating?.priceTarget) {
                targetPrice = +mostOptimisticRating?.priceTarget;
                method = `from analyst (${mostOptimisticRating?.analyst?.shortName}, ` + DateHelper.convertDateToGerman(mostOptimisticRating?.date) + `)`;
                methodShort = `from ${mostOptimisticRating?.analyst?.shortName}`;
                if (mostOptimisticRating.currency && this.currency) {
                    if (mostOptimisticRating.currency.name !== this.currency.name) {
                        target = +(target * mostOptimisticRating.currency.rate / this.currency.rate).toFixed();
                        targetPrice = targetPrice * mostOptimisticRating.currency.rate / this.currency.rate;
                        method += ' (converted)';
                    }
                }
            }
        }
        let chance = 0;
        if (actualPrice > 0 && targetPrice > actualPrice) {
            chance = +((100 / actualPrice * targetPrice) - 100).toFixed();
        }
        const targetSummary = {
            position: this,
            actual: actual,
            target: target,
            targetPrice: targetPrice,
            chance: chance,
            method: method,
            methodShort: methodShort
        };

        return targetSummary;
    }


    public getExtraPolaSummary(): ExtraPolaSummary {
        let method = 'none';
        let avgPerformance = 0;
        let actual = +this.actualValue();
        let extraPolatedValue = +this.actualValue();
        let extraPolatedPrice = 0;
        let extraPolatedDividend = 0;
        let dividendCurrency = this.currency ? this.currency.name : '';
        let actualPrice = 0;
        if (this.balance?.lastRate) {
            actualPrice = this.balance?.lastRate.rate;
        }

        const shareheadsAveragePerformance = this.shareheadShare?.getAvgPerformance();
        if (shareheadsAveragePerformance) {
            avgPerformance = +shareheadsAveragePerformance;
        }
        if (this.balance && avgPerformance > 0) {
            const lastRate = this.balance.lastRate;
            const lastAvgRate = this.shareheadShare?.lastBalance()?.avgRate;
            let baseRate = 0;
            if (lastRate instanceof StockRate && lastAvgRate !== undefined) {
                if (lastRate.rate < lastAvgRate) {
                    baseRate = lastRate.rate;
                    method = 'from last rate (' + baseRate + ')';
                } else {
                    baseRate = lastAvgRate;
                    method = 'from last average rate (' + baseRate + ')';
                }
                extraPolatedPrice = baseRate;
            }
            if (baseRate > 0) {
                extraPolatedPrice = baseRate;
                for (let x = 0; x < 5; x++) {
                    extraPolatedPrice *= ( avgPerformance / 100 + 1);
                }
                extraPolatedValue = +(this.balance.amount * extraPolatedPrice).toFixed();
            }
        }

        const dividendProjection = this.extrapolateProjection(5);
        if (dividendProjection) {
            if (dividendProjection.currencyCorrectedProjectionValue) {
                extraPolatedDividend = +(dividendProjection.currencyCorrectedProjectionValue).toFixed();
            } else if (!isNaN(dividendProjection.projectionValue)) {
                extraPolatedDividend = +(dividendProjection.projectionValue).toFixed();
            }
        }

        let chance = 0;
        if (actualPrice && extraPolatedPrice > actualPrice) {
            chance = +((100 / actualPrice * extraPolatedPrice) - 100).toFixed();
        }
        const extraPolaSummary = {
            position: this,
            actual: actual,
            avgPerformance: avgPerformance,
            extraPolatedValue: extraPolatedValue,
            extraPolatedPrice: extraPolatedPrice,
            extraPolatedDividend: extraPolatedDividend,
            dividendCurrency: dividendCurrency,
            performance: chance,
            method: method,
        };

        return extraPolaSummary;
    }


    public urlSwissquote(): string|null {
        if (this.share && this.currency) {
            let currencyName = this.currency.name;
            if (currencyName === 'GBP') {
                currencyName = 'GBX';
            }
            return `https://www.swissquote.ch/trading-platform/#fullQuote/${this.share.isin}/${this.share.marketplace?.urlKey}_${currencyName}`;
        }

        return null;
    }


    public dividendProjections(): any {
        const results = [];

        if (this.shareheadShare) {
            const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
            const nextYearP1 = new Date(new Date().setFullYear(new Date().getFullYear() + 2));
            const nextYearP2 = new Date(new Date().setFullYear(new Date().getFullYear() + 3));

            let projection = this.generateProjection(nextYear);
            if (projection) {
                results.push(projection);
            }
            projection = this.generateProjection(nextYearP1);
            if (projection) {
                results.push(projection);
            }
            projection = this.generateProjection(nextYearP2);
            if (projection) {
                results.push(projection);
            }
            const extrapolationDelta = 5;
            projection = this.extrapolateProjection(extrapolationDelta);
            if (projection) {
                results.push(projection);
            }
        }

        return results;
    }


    public shareheadDividendPayment(): string {
        let result = '';
        if (this.shareheadShare && this.balance) {
            const lastBalance = this.shareheadShare.lastBalance();
            if (lastBalance) {
                result = (lastBalance?.dividend * this.balance.amount).toFixed(0);
            }
        }

        return result;
    }


    public bestSelectedDividendPayment(): string {
        let result = '';
        if (this.manualDividend) {
            result = this.manualDividendPayment();
        } else if (this.shareheadShare && this.balance) {
            result = this.shareheadDividendPaymentCorrected();
        } else if (this.balance) {
            result = this.balance.projectedNextDividendPayment.toString();
        }

        return result;
    }


    public shareheadDividendPaymentCorrected(): string {
        let result = '';
        if (this.shareheadShare && this.balance) {
            const lastBalance = this.shareheadShare.lastBalance();
            let relevantAmount = this.balance.amount;
            // todo: implement a method, that checks dividend-transactions and amount-changing-transactions for correcting the result
            if (lastBalance) {
                if (this.currency?.name == this.shareheadShare.currency?.name) {
                    result = (lastBalance?.dividend * relevantAmount).toFixed(0);
                } else if (lastBalance.currency) {
                    result = (lastBalance.dividend * lastBalance.currency.rate * relevantAmount).toFixed(0);
                    if (this.currency && this.currency?.name !== 'CHF') {
                        result = (+result / this.currency.rate).toFixed(0);
                    }
                }
            }
        }

        return result;
    }


    public manualDividendPayment(): string {
        let result = '';
        if (this.manualDividend && this.balance) {
            result = (this.manualDividend * this.balance.amount).toFixed(0);
        }

        return result;
    }


    manualYieldOnInvestent(): string
    {
        let result = 0;
        if (this.manualDividend && this.balance) {
            result = (100 / this.balance.investment * +this.manualDividendPayment());
        }

        return result.toFixed(1);
    }


    public closedResultCorrected(): string {
        let result = '';
        if (this.balance && this.balance.closedResult) {
            result = this.balance.closedResult.toFixed(0);
            if (this.currency && this.currency?.name !== 'CHF') {
                result = (this.balance.closedResult * this.currency.rate).toFixed(0);
            }
        }

        return result;
    }


    // todo: useless
    public getStockRates(): Observable<StockRate[]> {
        return new Observable(obsData => {
            if (this.share && this.currency) {
                let currencyName = this.currency.name;
                if (currencyName === 'GBP') {
                    currencyName = 'GBX';
                }
                let request = new XMLHttpRequest();
                const ratesUrl = `https://www.swissquote.ch/sqi_ws/HistoFromServlet?format=pipe&key=${this.share.isin}_${this.share.marketplace?.urlKey}_${currencyName}&ftype=day&fvalue=1&ptype=a&pvalue=1`;
                request.open("GET", ratesUrl, false);
                request.send(null);
                let content = request.responseText;
                // console.log(content);
                let rates: StockRate[] = [];
                rates = SwissquoteHelper.parseRates(content, currencyName === 'GBX');

                obsData.next(rates);
            }
        });
    }


    public maxDividendTransactionsByPeriodicy(): number {
        switch(this.dividendPeriodicity) {
            case 'quaterly':
                return 4;
            case 'half-yearly':
                return 2;
            default:
                return 1;
        }
    }


    public getMaxDrawdownSummary(): MaxDrawdownSummary|undefined {
        let summary = undefined;
        if (this.balance) {
            const shareheadPostCoronaTop = this.shareheadShare?.postCoronaTop();
            const financialCrisisDrawdown = this.shareheadShare?.financialCrisisDrawdown();
            const coronaPandemicDrawdown = this.shareheadShare?.coronaPandemicDrawdown();
            let maxDrawDown = 90;
            let method = 'hardcoded';
            if (financialCrisisDrawdown && coronaPandemicDrawdown) {
                if (financialCrisisDrawdown < coronaPandemicDrawdown) {
                    maxDrawDown = financialCrisisDrawdown * -1;
                    method = 'by financial crisis';
                } else {
                    maxDrawDown = coronaPandemicDrawdown * -1;
                    method = 'by corona pandemic';
                }
            }
            if (this.manualDrawdown) {
                maxDrawDown = this.manualDrawdown;
                method = 'manual';
            }
            let topValue = 0;
            if (shareheadPostCoronaTop) {
                topValue = this.balance.amount * shareheadPostCoronaTop?.rate;
            } else if (this.balance.lastRate) {
                topValue = this.balance.amount * this.balance.lastRate?.rate;
            }
            if (topValue > 0) {
                if (this.currency && this.shareheadShare?.currency && this.shareheadShare?.currency?.name !== this.currency?.name) {
                    const usersCurrency = Forexhelper.getUsersCurrencyByName(this.shareheadShare?.currency.name);
                    if (usersCurrency) {
                        topValue = usersCurrency.rate * topValue;
                        if (this.currency?.name !== 'CHF') {
                            topValue = topValue / this.currency.rate;
                        }
                    }
                }
                let maxDrawDownValue = +(topValue * ((100 - maxDrawDown) / 100)).toFixed();
                let lombardValue = +(maxDrawDownValue / 2).toFixed();
                let fromInvestment = +(100 / this.balance.investment * lombardValue).toFixed();
                let fromTop = +(100 / topValue * lombardValue).toFixed();
                const risk = +(+this.actualValue() - maxDrawDownValue).toFixed();
                summary = {
                    postCoronaTop: shareheadPostCoronaTop,
                    postCoronaTopValue: shareheadPostCoronaTop ? +topValue.toFixed() : undefined,
                    maxDrawdown: maxDrawDown * -1,
                    maxDrawdownValue: maxDrawDownValue,
                    method: method,
                    lombardValue: lombardValue,
                    lombardValueFromInvestment: fromInvestment,
                    lombardValueFromPostCoronaTop: fromTop,
                    risk: risk
                };
            }
        }

        return summary;
    }


    getDividendDropSummary(): DividendDropSummary|undefined {
        let summary = undefined;
        if (this.balance) {
            let nextDividendPayment = 0;
            let worstEverDividendDrop = 0;
            let worstEverDividendDropNote = '';
            if (this.shareheadShare) {
                nextDividendPayment = +this.shareheadDividendPayment();
                const worstEverDividendDropInfos = this.shareheadShare.worstEverDividendDrop();
                worstEverDividendDrop = worstEverDividendDropInfos[0];
                worstEverDividendDropNote = worstEverDividendDropInfos[1];
            } else {
                if (this.manualDividend) {
                    nextDividendPayment = +this.manualDividendPayment();
                    worstEverDividendDropNote = 'manual dividend';
                } else {
                    const year = new Date().getFullYear();
                    nextDividendPayment = this.plannedDividendsTotalByYear(year).total;
                    worstEverDividendDropNote = `dividend projection ${year}`;
                }
            }

            let maxDividendDrop = worstEverDividendDrop;
            let method = worstEverDividendDropNote;
            if (this.manualDividendDrop !== undefined && !isNaN(this.manualDividendDrop)) {
                maxDividendDrop = this.manualDividendDrop;
                method = 'manual drop';
            }
            if (nextDividendPayment) {
                let currentDividend = nextDividendPayment;
                if (this.currency && this.shareheadShare?.currency && this.shareheadShare?.currency?.name !== this.currency?.name) {
                    const usersCurrency = Forexhelper.getUsersCurrencyByName(this.shareheadShare?.currency.name);
                    if (usersCurrency) {
                        currentDividend = usersCurrency.rate * currentDividend;
                        if (this.currency?.name !== 'CHF') {
                            currentDividend = currentDividend / this.currency.rate;
                        }
                    }
                }
                let maxDrawDownValue = +(currentDividend * ((100 - maxDividendDrop) / 100)).toFixed();
                let lombardValue = +(maxDrawDownValue / 2).toFixed();
                let dividendAfterDrop = +(currentDividend * ((100 - maxDividendDrop) / 100)).toFixed(0);
                let fromInvestment = +(100 / this.balance.investment * lombardValue).toFixed();
                let fromTop = +(100 / currentDividend * lombardValue).toFixed();
                summary = {
                    maxDrop: maxDividendDrop,
                    maxDropValue: 2,
                    method: method,
                    actualDividend: currentDividend,
                    dividendAfterDrop: dividendAfterDrop
                };
            }
        }

        return summary
    }


    costIncomeChartdata(): ChartData|undefined
    {
        if (this.balance) {

            return {
                labels: ['Transaktionskosten vs Einnahmen'],
                datasets: [
                    {
                        label: 'Kosten',
                        data: [this.balance.transactionFeesTotal]
                    },
                    {
                        label: 'Einnahmen',
                        data: [this.balance.collectedDividends]
                    },
                ]
            };
        } else {

            return undefined;
        }
    }


    private extrapolateProjection(extrapolationDelta: number): DividendProjection|null
    {
        let projection = null;

        const lastYield = this.extrapolateYield(extrapolationDelta);

        const extraYear = new Date(new Date().setFullYear(new Date().getFullYear() + extrapolationDelta));

        if (this.balance && this.shareheadShare && this.balance?.lastRate) {
            projection = DividendProjectionCreator.createNewDividendProjection();
            projection.year = extraYear;
            let projectedValue = (lastYield * this.balance.averagePayedPriceGross * this.balance?.amount) / 100;
            projection.projectionValue = projectedValue;
            projection.projectionCurrency = '' + this.shareheadShare.currency?.name;
            projection.projectionSource = '(by xtrapolatn with ' + this.shareheadShare.getAvgDividendRaise() + '%)';
            if (this.shareheadShare.currency && this.shareheadShare.currency.rate && this.currency?.name !== this.shareheadShare.currency?.name) {
                const usersCurrency = Forexhelper.getUsersCurrencyByName(this.shareheadShare.currency?.name);
                if (usersCurrency) {
                    projectedValue = projectedValue * usersCurrency.rate;
                    if (this.currency?.rate && this.currency?.name !== 'CHF') {
                        projectedValue = projectedValue / this.currency.rate;
                    }
                }
                projection.currencyCorrectedProjectionValue = projectedValue;
                projection.currencyCorrectedProjectionCurrency = this.currency?.name;
            }
            projection.yieldFloat = (100 / this.balance.investment * projectedValue).toFixed(1).toString() + '%';
        }

        return projection;
    }


    private extrapolateYield(extrapolationDelta: number): number
    {
        let extraYield = 0;
        if (this.shareheadShare && this.balance?.lastRate) {
            const lastBalance = this.shareheadShare.lastBalance();
            if (lastBalance) {
                // extraYield = +(100 / this.balance.investment * lastBalance?.dividend).toFixed(1)
                extraYield = +(100 / this.balance.averagePayedPriceGross * lastBalance?.dividend).toFixed(1);
                const avgDividendRaise = +this.shareheadShare.getAvgDividendRaise();
                for (let x = 0; x < extrapolationDelta; x++) {
                    extraYield *= ((avgDividendRaise / 100) + 1);
                }
            }
        }

        return extraYield;
    }


    private generateProjection(nextYear: Date): DividendProjection|null {
        if (this.shareheadShare) {
            const nextYearEstimation = this.shareheadShare.lastEstimationForYear(nextYear);

            if (nextYearEstimation) {
                const projection = DividendProjectionCreator.createNewDividendProjection();
                projection.year = nextYear;
                if (this.balance && this.currency?.rate) {
                    let projectedValue = nextYearEstimation.dividend * this.balance?.amount;
                    projection.projectionValue = projectedValue;
                    projection.projectionCurrency = '' + nextYearEstimation.currency?.name;
                    projection.projectionSource = '(by analysts estimations)';
                    if (nextYearEstimation.currency && nextYearEstimation.currency.rate && this.currency?.name !== nextYearEstimation.currency?.name) {
                        const usersCurrency = Forexhelper.getUsersCurrencyByName(nextYearEstimation.currency?.name);
                        if (usersCurrency) {
                            projectedValue = nextYearEstimation.dividend * usersCurrency.rate * this.balance?.amount;
                            if (this.currency?.name !== 'CHF') {
                                projectedValue = projectedValue / this.currency.rate;
                            }
                        }
                        projection.currencyCorrectedProjectionValue = projectedValue;
                        projection.currencyCorrectedProjectionCurrency = this.currency?.name;
                    }
                    projection.yieldFloat = (100 / this.balance.investment * projectedValue).toFixed(1).toString() + '%';
                }

                return projection;
            }
        }

        return null;
    }

    private manualNextDividendPayment(): number|undefined
    {
        let result;
        if (this.balance && this.balance.amount && this.manualDividendExDate && this.manualDividendPayDate && this.manualDividendAmount && this.manualDividendAmount > 0) {
            result = +((this.manualDividendAmount * this.balance.amount).toFixed(0));
        }

        return result;
    }
}
