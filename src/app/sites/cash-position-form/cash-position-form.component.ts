import {Component, OnInit} from '@angular/core';
import {Portfolio} from "../../models/portfolio";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {PositionService} from "../../services/position.service";
import {PortfolioService} from "../../services/portfolio.service";
import {ShareService} from "../../services/share.service";
import {CurrencyService} from "../../services/currency.service";
import {ShareheadService} from "../../services/sharehead.service";
import {TranslationService} from "../../services/translation.service";
import {Position} from "../../models/position";
import {BankAccount} from "../../models/bank-account";
import {Currency} from "../../models/currency";
import {PositionCreator} from "../../creators/position-creator";
import {MotherFormComponent} from "../mother-form.component";
import {FormControl, FormGroup, Validators} from "@angular/forms";


@Component({
    selector: 'app-cash-position-form',
    templateUrl: './cash-position-form.component.html',
    styleUrls: ['./cash-position-form.component.scss']
})
export class CashPositionFormComponent extends MotherFormComponent implements OnInit {

    public position: Position;
    public portfolio: Portfolio | null = null;
    public bankAccounts: BankAccount[] = [];
    private bankAccountIndex: number = 0;
    public currencies: Currency[] = [];

    positionForm = new FormGroup({
        currency: new FormControl('', Validators.required),
    });

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private positionService: PositionService,
        private portfolioService: PortfolioService,
        private shareService: ShareService,
        private currencyService: CurrencyService,
        private shareheadService: ShareheadService,
        public tranService: TranslationService,
    ) {
        super();
        this.position = PositionCreator.createNewPosition();
    }

    ngOnInit(): void {
        this.loadData();
        this.route.params.subscribe((params: Params) => {
            const accountIndex = +params['aid'];
            this.bankAccountIndex = accountIndex;
        });
    }

    onSubmit(): void {
        this.patchValuesBack(this.positionForm, this.position);
        this.position.isCash = true;
        this.position.bankAccount = this.bankAccounts[this.bankAccountIndex];
        // const newShare = ShareCreator.createNewShare();
        // if (this.position.currency) {
        //     newShare.name = this.position.currency?.name;
        // }
        // this.position.share = newShare;
        console.log(this.position);
        if (this.position.id > 0) {
            // this.positionService.update(this.position)
            //     .subscribe(position => {
            //         this.router.navigate(['my-dashboard']);
            //     });
            console.error('updating a cash-position is not yet implemented');
        } else {
            this.positionService.createCashPosition(this.position)
                .subscribe(position => {
                    this.router.navigate(['my-dashboard']);
                });
        }
    }


    private loadData(): void {
        const myKey = localStorage.getItem('my-key');
        this.portfolioService.portfolioByKey(myKey)
            .subscribe(returnedPortfolio => {
                this.portfolio = returnedPortfolio;
                if (this.portfolio instanceof Portfolio) {
                    this.bankAccounts = this.portfolio.getBankAccountsWithoutPositions();
                }
            });
        this.shareheadService.getAllCurrencies()
            .subscribe(currencies => {
                console.log(currencies);
                this.currencies = currencies;
            });
    }

}
