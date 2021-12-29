import {Component, OnInit} from '@angular/core';
import {TranslationService} from '../../services/translation.service';
import {Position} from "../../models/position";
import {Currency} from "../../models/currency";
import {Share} from "../../models/share";
import {Transaction} from "../../models/transaction";


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
    public positions: Position[] = [];
    public resolvedActions = 0;
    public veryBadThingsHappend = 0;
    public unresolvedActions: ParsedTransaction[] = [];

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
        fileReader.readAsText(this.file);
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
        this.positions = this.convertTransactionsToPositions(this.parsedTransactions);
    }

    private parseTransaction(cells: string[]): ParsedTransaction {
        const dateSplit = cells[0].substring(0, 10).split('-');
        return {
            date: new Date(+dateSplit[2], +dateSplit[1], +dateSplit[0]),
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
        transactions.forEach(parsedAction => {
            let position = null;
            let transaction = null;
            switch(parsedAction.title) {
                case 'Kauf':
                    const currency = Currency.createNewCurrency();
                    currency.name = parsedAction.currencyName;

                    const share = Share.createNewShare();
                    share.name = parsedAction.name;
                    share.isin = parsedAction.isin;
                    share.shortname = parsedAction.symbol;

                    transaction = Transaction.createNewTransaction();
                    transaction.date = parsedAction.date;
                    transaction.quantity = parsedAction.quantity;
                    transaction.fee = parsedAction.fee;
                    transaction.rate = parsedAction.rate;

                    position = this.getPositonFromPositionsByIsin(parsedAction.isin, positions);
                    if (null === position) {
                        position = Position.createNewPosition();
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
                case 'Verkauf':
                    position = this.getPositonFromPositionsByIsin(parsedAction.isin, positions);
                    if (null === position) {
                        console.warn('das ist aber gar nicht gut...');
                        this.veryBadThingsHappend++;
                    } else {
                        transaction = Transaction.createNewTransaction();
                        transaction.date = parsedAction.date;
                        transaction.quantity = parsedAction.quantity * -1;
                        transaction.fee = parsedAction.fee;
                        transaction.rate = parsedAction.rate;
                        position.transactions.push(transaction);
                        this.resolvedActions++;
                    }
                    break;
                default:
                    this.unresolvedActions.push(parsedAction);
            }
        })

        return positions;
    }


    private getPositonFromPositionsByIsin(isin: string, positions: Position[]): Position|null {
        let hit = null;
        positions.forEach(position => {
            if (position.share?.isin == isin) {
                hit = position;
            }
        });

        return hit;
    }

}
