import {Component, OnInit} from '@angular/core';
import {TranslationService} from '../../services/translation.service';
import {Position} from "../../models/position";
import {Currency} from "../../models/currency";
import {Share} from "../../models/share";


export interface ParsedTransaction {
    date: Date;
    title: string;
    symbol: string;
    name: string;
    isin: string;
    quantity: number;
    price: number;
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
            price: +cells[7],
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
        transactions.forEach(transaction => {
            if (transaction.title === 'Kauf') {
                const currency = Currency.createNewCurrency();
                currency.name = transaction.currencyName;

                const share = Share.createNewShare();
                share.name = transaction.name;
                share.isin = transaction.isin;
                share.shortname = transaction.symbol;

                const position = Position.createNewPosition();
                position.share = share;
                position.currency = currency;
                position.activeFrom = transaction.date;

                positions.push(position);
            }
        })

        return positions;
    }

}
