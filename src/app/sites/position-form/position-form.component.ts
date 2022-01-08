import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {PositionService} from '../../services/position.service';
import {Position} from '../../models/position';
import {ShareService} from '../../services/share.service';
import {Share} from '../../models/share';
import {CurrencyService} from '../../services/currency.service';
import {Currency} from '../../models/currency';
import {ShareheadService} from '../../services/sharehead.service';
import {MotherFormComponent} from '../mother-form.component';
import {PositionCreator} from "../../creators/position-creator";
import {TranslationService} from "../../services/translation.service";
import {PortfolioService} from "../../services/portfolio.service";
import {Portfolio} from "../../models/portfolio";
import {BankAccount} from "../../models/bank-account";
import {TypeaheadMatch} from "ngx-bootstrap/typeahead";
import {ShareCreator} from "../../creators/share-creator";


@Component({
    selector: 'app-position-form',
    templateUrl: './position-form.component.html',
    styleUrls: ['./position-form.component.scss']
})
export class PositionFormComponent extends MotherFormComponent implements OnInit {

    public position: Position;
    public portfolio: Portfolio|null = null;
    public bankAccounts: BankAccount[] = [];
    private bankAccountIndex: number = 0;
    public shares: Share[] = [];
    public shareHeadShares: Share[] = [];
    public currencies: Currency[] = [];

    positionForm = new FormGroup({
        shareName: new FormControl(''),
        currency: new FormControl(''),
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
            const positionId = +params['id'];
            if (positionId) {
                this.positionService.getPosition(positionId)
                    .subscribe(position => {
                        console.log(position);
                        if (position instanceof Position) {
                            this.position = position;
                        }
                    });
            } else {
                this.position = PositionCreator.createNewPosition();
            }
        });
    }

    onSelect(event: TypeaheadMatch): void {
        console.log(event);
        console.log(event.item);
        this.position.share = event.item;
        // this.positionForm.get('shareName')?.setValue(event.item.name);
        console.log(this.position);
        // this.position.share.name = event.name;
    }

    onSubmit(): void {
        this.patchValuesBack(this.positionForm, this.position);
        this.position.bankAccount = this.bankAccounts[this.bankAccountIndex];
        console.log(this.position);
        if (this.position.id > 0) {
            // this.positionService.update(this.position)
            //     .subscribe(position => {
            //         this.router.navigate(['my-dashboard']);
            //     });
        } else {
            this.positionService.create(this.position)
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
        this.shareService.getAllShares()
            .subscribe(shares => {
                console.log(shares);
                this.shares = shares;
            });
        this.shareheadService.getAllShares()
            .subscribe(shares => {
                console.log(shares);
                this.shareHeadShares = shares;
            });
        this.shareheadService.getAllCurrencies()
            .subscribe(currencies => {
                console.log(currencies);
                this.currencies = currencies;
            });
    }

}
