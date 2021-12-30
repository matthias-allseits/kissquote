import {Component, OnInit} from '@angular/core';
import {TranslationService} from '../../services/translation.service';
import {Position} from "../../models/position";
import {CurrencyCreator} from "../../creators/currency-creator";
import {PositionCreator} from "../../creators/position-creator";
import {ShareCreator} from "../../creators/share-creator";
import {TransactionCreator} from "../../creators/transaction-creator";
import {Dividend} from "../../models/dividend";
import {DividendCreator} from "../../creators/dividend-creator";
import {Currency} from "../../models/currency";


export interface ParsedTransaction {
    date: Date;
    title: string;
    symbol: string;
    name: string;
    isin: string;
    quantity: number;
    rate: number;
    fee: number;
    zinsen: number;
    nettoTotal: number;
    currencyName: string;
    accountTotal: number;
    saldo: number;
    accountCurrencyName: string;
}

@Component({
    selector: 'app-upload',
    templateUrl: './upload.component.html',
    styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {

    private file: File|null = null;
    public parsedTransactions: ParsedTransaction[] = [];
    public badTransactions: ParsedTransaction[] = [];
    public allPositions: Position[] = [];
    public cashPositions: Position[] = [];
    public openPositions: Position[] = [];
    public closedPositions: Position[] = [];
    public dividends: Dividend[] = [];
    public resolvedActions = 0;
    public veryBadThingsHappend = 0;

    constructor(
        public tranService: TranslationService
    ) {
    }

    ngOnInit(): void {
    }


    fileChanged(event: any): void {
        if (event.target && event.target.files) {
            this.file = event.target.files[0];
        }
    }

    onSubmit(): void {
        let fileReader = new FileReader();
        fileReader.onload = (e) => {
            this.parseContent(fileReader.result);
        }
        // @ts-ignore
        fileReader.readAsBinaryString(this.file);
    }

    submitResult(): void {
        // todo: send result to the api
    }

    private parseContent(content: any): void {
        // todo: implement a validation of the content
        // console.log(content);
        const lines = content.split("\n");
        lines.forEach((line: any, index: number) => {
            line = line.replaceAll("'", '');
            line = line.replaceAll("\r", '');
            const cells = line.split(';');
            if (cells.length > 3 && cells[0].indexOf('-') > 0) {
                const transaction = this.parseTransaction(cells);
                this.parsedTransactions.push(transaction);
            }
        });
        this.parsedTransactions.reverse();
        console.log(this.parsedTransactions);
        this.allPositions = this.convertTransactionsToPositions(this.parsedTransactions);
        this.allPositions.forEach(position => {
            if (position.active) {
                if (position.isCash) {
                    this.cashPositions.push(position);
                } else {
                    this.openPositions.push(position);
                }
            } else {
                this.closedPositions.push(position);
            }
        });
    }

    private parseTransaction(cells: string[]): ParsedTransaction {
        const dateSplit = cells[0].substring(0, 10).split('-');
        return {
            date: new Date(+dateSplit[2], +dateSplit[1]-1, +dateSplit[0]),
            title: cells[2],
            symbol: cells[3],
            name: cells[4],
            isin: cells[5],
            quantity: +cells[6],
            rate: +cells[7],
            fee: +cells[8],
            zinsen: +cells[9],
            nettoTotal: +cells[10],
            currencyName: cells[11],
            accountTotal: +cells[12],
            saldo: +cells[13],
            accountCurrencyName: cells[14],
        }
    }


    private convertTransactionsToPositions(transactions: ParsedTransaction[]): Position[] {
        const positions: Position[] = [];
        const currencies: Currency[] = [];
        transactions.forEach(parsedAction => {
            let position = null;
            let transaction = null;
            let currency = null;
            let share = null;
            switch(parsedAction.title) {
                case 'Vergütung':
                case 'Fx-Gutschrift Comp.':
                case 'Forex-Gutschrift':
                case 'Zins':
                case 'Einzahlung':
                    currency = this.getCurrencyByName(parsedAction.currencyName, currencies);
                    currency.name = parsedAction.currencyName;

                    share = ShareCreator.createNewShare();
                    share.name = currency.name;

                    transaction = TransactionCreator.createNewTransaction();
                    transaction.date = parsedAction.date;
                    transaction.quantity = parsedAction.quantity;
                    transaction.fee = parsedAction.fee;
                    transaction.rate = parsedAction.rate;
                    if (parsedAction.title === 'Zins') {
                        transaction.isInterest;
                    }

                    position = this.getCashPositionFromPositionsByName(share.name, positions);
                    if (null === position) {
                        position = PositionCreator.createNewPosition();
                        position.share = share;
                        position.currency = currency;
                        position.activeFrom = parsedAction.date;
                        position.isCash = true;
                        position.transactions.push(transaction);
                        positions.push(position);
                    } else {
                        position.transactions.push(transaction);
                    }
                    this.resolvedActions++;
                    break;
                case 'Titeleingang':
                case 'Corporate Action':
                case 'Ausgabe von Anrechten':
                case 'Kauf':
                case 'Kapitalerhöhung':
                    currency = this.getCurrencyByName(parsedAction.currencyName, currencies);

                    share = ShareCreator.createNewShare();
                    share.name = parsedAction.name;
                    share.isin = parsedAction.isin;
                    share.shortname = parsedAction.symbol;

                    transaction = TransactionCreator.createNewTransaction();
                    transaction.date = parsedAction.date;
                    transaction.quantity = parsedAction.quantity;
                    transaction.fee = parsedAction.fee;
                    transaction.rate = parsedAction.rate;

                    position = this.getPositonFromPositionsByIsin(parsedAction.isin, positions);
                    if (null === position) {
                        position = PositionCreator.createNewPosition();
                        position.share = share;
                        position.currency = currency;
                        position.activeFrom = parsedAction.date;
                        position.transactions.push(transaction);
                        positions.push(position);
                    } else {
                        position.transactions.push(transaction);
                    }
                    this.resolvedActions++;
                    break;
                case 'Auszahlung':
                case 'Fx-Belastung Comp.':
                case 'Forex-Belastung':
                case 'Depotgebühren':
                    position = this.getCashPositionFromPositionsByName(parsedAction.currencyName, positions);
                    if (null === position) {
                        console.warn('das ist aber gar nicht gut weil beim Verkauf Position tot: ' + parsedAction.title + ' ' + parsedAction.name + ' (' + parsedAction.isin + ')');
                        this.veryBadThingsHappend++;
                    } else {
                        transaction = TransactionCreator.createNewTransaction();
                        transaction.date = parsedAction.date;
                        transaction.quantity = parsedAction.quantity * -1;
                        transaction.fee = parsedAction.fee;
                        transaction.rate = parsedAction.rate;
                        transaction.isFee = parsedAction.title === 'Depotgebühren';
                        position.transactions.push(transaction);
                        this.resolvedActions++;
                    }
                    break;
                case 'Verkauf':
                case 'Titelausgang':
                case 'Verfall von Anrechten':
                    position = this.getPositonFromPositionsByIsin(parsedAction.isin, positions);
                    if (null === position) {
                        console.warn('das ist aber gar nicht gut weil beim Verkauf Position tot: ' + parsedAction.title + ' ' + parsedAction.name + ' (' + parsedAction.isin + ')');
                        this.veryBadThingsHappend++;
                    } else {
                        if (parsedAction.quantity === position.quantityTotal()) {
                            position.activeUntil = parsedAction.date;
                            position.active = false;
                        }
                        transaction = TransactionCreator.createNewTransaction();
                        transaction.date = parsedAction.date;
                        transaction.quantity = parsedAction.quantity * -1;
                        transaction.fee = parsedAction.fee;
                        transaction.rate = parsedAction.rate;
                        position.transactions.push(transaction);
                        this.resolvedActions++;
                    }
                    break;
                case 'Dividende':
                case 'Capital Gain':
                case 'Kapitalrückzahlung':
                    currency = this.getCurrencyByName(parsedAction.currencyName, currencies);

                    position = this.getPositonFromPositionsByIsin(parsedAction.isin, positions, false);
                    if (null === position) {
                        console.warn('das ist aber gar nicht gut weil die Dividende keiner Position zugewiesen werden kann: ' + parsedAction.title + ' ' + parsedAction.name + ' (' + parsedAction.isin + ')');
                        this.veryBadThingsHappend++;
                    } else {
                        const dividend = DividendCreator.createNewDividend();
                        dividend.share = position.share;
                        dividend.date = parsedAction.date;
                        // todo: calculate values-per-share
                        dividend.valueNet = parsedAction.rate;
                        dividend.valueGross = parsedAction.fee;
                        this.resolvedActions++;
                    }
                    break;
                // case 'Interne Titelumbuchung':
                // case 'Capital Gain (Storniert)':
                // case 'Dividende (Storniert)':
                // case 'Storno (Capital Gain)':
                // case 'Storno (Dividende)':
                //     no action needed?
                    // this.resolvedActions++;
                    // break;
                default:
                    console.log(parsedAction);
                    this.badTransactions.push(parsedAction);
            }
        })
        console.log(currencies);

        return positions;
    }


    private getPositonFromPositionsByIsin(isin: string, positions: Position[], mustBeActive = true): Position|null {
        let hit = null;
        positions.forEach(position => {
            if (mustBeActive) {
                if (position.share?.isin == isin && position.active) {
                    hit = position;
                }
            } else {
                if (position.share?.isin == isin) {
                    hit = position;
                }
            }
        });

        return hit;
    }


    private getCashPositionFromPositionsByName(name: string, positions: Position[]): Position|null {
        let hit = null;
        positions.forEach(position => {
            if (position.share?.isin === null && position.isCash && position.share?.name == name) {
                hit = position;
            }
        });

        return hit;
    }


    private getCurrencyByName(name: string, currencies: Currency[]): Currency {
        if (name === '') {
            name = 'not defined';
        }
        let hit = null;
        currencies.forEach(currency => {
            if (currency.name === name) {
                hit = currency;
            }
        });
        if (null === hit) {
            hit = CurrencyCreator.createNewCurrency();
            hit.name = name;
            currencies.push(hit);
        }

        return hit;
    }

}
