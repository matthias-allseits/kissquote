import {Component, OnInit} from '@angular/core';
import {Transaction} from "../../models/transaction";
import {Position} from "../../models/position";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {formatDate, Location} from "@angular/common";
import {PositionService} from "../../services/position.service";
import {TransactionService} from "../../services/transaction.service";
import {TransactionCreator} from "../../creators/transaction-creator";
import {MotherFormComponent} from "../mother-form.component";
import {ShareCreator} from "../../creators/share-creator";
import {TranslationService} from "../../services/translation.service";
import {CurrencyService} from "../../services/currency.service";
import {Currency} from "../../models/currency";


@Component({
    selector: 'app-cash-transaction-form',
    templateUrl: './cash-transaction-form.component.html',
    styleUrls: ['./cash-transaction-form.component.scss']
})
export class CashTransactionFormComponent extends MotherFormComponent implements OnInit {

    public transaction: Transaction;
    public position: Position|null = null;
    public currencies: Currency[] = [];
    public titleOptions = ['Kauf', 'Fx-Gutschrift Comp.', 'Zins', 'Verkauf', 'Auszahlung', 'Dividende', 'Capital Gain', 'Forex-Gutschrift', 'Vergütung', 'Einzahlung', 'Depotgebühren', 'Fx-Belastung Comp.', 'Kapitalrückzahlung', 'Forex-Belastung', 'Corporate Action', 'Split'];


    transactionForm = new FormGroup({
        title: new FormControl(''),
        date: new FormControl(),
        rate: new FormControl('', Validators.required),
        fee: new FormControl(''),
        currency: new FormControl('', Validators.required),
    });

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private positionService: PositionService,
        private currencyService: CurrencyService,
        private transactionService: TransactionService,
        public tranService: TranslationService,
    ) {
        super();
        this.transaction = TransactionCreator.createNewTransaction();
    }

    ngOnInit(): void {
        const now = new Date();
        const dateString = formatDate(now, 'yyyy-MM-dd', 'en');
        console.log(dateString);
        this.transactionForm.get('date')?.setValue(dateString);
        this.route.params.subscribe((params: Params) => {
            const positionId = +params['pid'];
            const transactionId = +params['id'];
            if (positionId > 0) {
                this.positionService.getPosition(positionId)
                    .subscribe(position => {
                        console.log(position);
                        if (position instanceof Position) {
                            this.position = position;
                        }
                    });
                if (transactionId > 0) {
                    this.transactionService.getTransaction(transactionId)
                        .subscribe(transaction => {
                            console.log(transaction);
                            if (transaction instanceof Transaction) {
                                this.transaction = transaction;
                                this.transactionForm.patchValue(transaction, { onlySelf: true });
                                this.transactionForm.get('date')?.setValue(formatDate(transaction.date, 'yyyy-MM-dd', 'en'));
                            }
                            this.setCurrency();
                        });
                } else {
                    this.transaction = TransactionCreator.createNewTransaction();
                }
            } else {
                throw Error;
            }
            this.currencyService.getAllCurrencies()
                .subscribe(currencies => {
                    this.currencies = currencies;
                });
        });
    }

    get quantity() { return this.transactionForm.get('quantity'); }

    onSubmit(): void {
        this.patchValuesBack(this.transactionForm, this.transaction);
        this.transaction.position = this.position;
        this.transaction.quantity = 1;
        if (this.transaction.position) {
            this.transaction.position.balance = undefined;
        }
        console.log(this.transaction);
        if (this.transaction.id > 0) {
            this.transactionService.update(this.transaction)
                .subscribe(transaction => {
                    this.location.back();
                });
        } else {
            this.transactionService.create(this.transaction)
                .subscribe(transaction => {
                    this.location.back();
                });
        }
    }


    selectTitle(title: string): void {
        const share = ShareCreator.createNewShare();
        this.transactionForm.get('title')?.setValue(title);
    }


    private setCurrency(): void {
        console.log('set currency');
        this.currencies.forEach(currency => {
            if (this.transaction.currency?.name === currency.name) {
                this.transactionForm.get('currency')?.setValue(currency);
            }
        });
    }

}
