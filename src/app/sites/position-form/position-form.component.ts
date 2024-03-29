import {Component, OnInit} from '@angular/core';
import {FormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {PositionService} from '../../services/position.service';
import {Position} from '../../models/position';
import {ShareService} from '../../services/share.service';
import {CurrencyService} from '../../services/currency.service';
import {Currency} from '../../models/currency';
import {ShareheadService} from '../../services/sharehead.service';
import {MotherFormComponent} from '../mother-form.component';
import {PositionCreator} from "../../creators/position-creator";
import {TranslationService} from "../../services/translation.service";
import {PortfolioService} from "../../services/portfolio.service";
import {Portfolio} from "../../models/portfolio";
import {BankAccount} from "../../models/bank-account";
import {MarketplaceService} from "../../services/marketplace.service";
import {Marketplace} from "../../models/marketplace";
import {ShareCreator} from "../../creators/share-creator";
import {ShareheadShare} from "../../models/sharehead-share";
import {formatDate, Location} from "@angular/common";


@Component({
    selector: 'app-position-form',
    templateUrl: './position-form.component.html',
    styleUrls: ['./position-form.component.scss']
})
export class PositionFormComponent extends MotherFormComponent implements OnInit {

    public position: Position;
    public portfolio?: Portfolio;
    public bankAccounts: BankAccount[] = [];
    private bankAccountIndex: number = 0;
    private motherPositionId: number = 0;
    public marketplaces: Marketplace[] = [];
    public currencies: Currency[] = [];
    public selectableShares?: ShareheadShare[];
    private selectedShare?: ShareheadShare;
    public periodicies = [
        'yearly',
        'half-yearly',
        'quaterly',
    ];

    positionForm = new UntypedFormGroup({
        shareName: new FormControl('', Validators.required),
        shortName: new FormControl('', Validators.required),
        isin: new FormControl('', Validators.required),
        marketplace: new FormControl('', Validators.required),
        currency: new FormControl('', Validators.required),
        activeFrom: new FormControl('', Validators.required),
        activeUntil: new FormControl(''),
        active: new FormControl(''),
        dividendPeriodicity: new FormControl(''),
    });

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private positionService: PositionService,
        private portfolioService: PortfolioService,
        private shareService: ShareService,
        private currencyService: CurrencyService,
        private shareheadService: ShareheadService,
        private marketplaceService: MarketplaceService,
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
            const motherPositionId = +params['pid'];
            this.motherPositionId = motherPositionId;
            const positionId = +params['id'];
            if (positionId) {
                this.positionService.getPosition(positionId)
                    .subscribe(position => {
                        // console.log(position);
                        if (position instanceof Position) {
                            this.position = position;
                            this.positionForm.get('shareName')?.setValue(position.share?.name);
                            this.positionForm.get('shortName')?.setValue(position.share?.shortname);
                            this.positionForm.get('isin')?.setValue(position.share?.isin);
                            this.positionForm.get('dividendPeriodicity')?.setValue(position.dividendPeriodicity);
                            this.positionForm.get('activeFrom')?.setValue(formatDate(position.activeFrom, 'yyyy-MM-dd', 'en'));
                            if (position.activeUntil) {
                                this.positionForm.get('activeUntil')?.setValue(formatDate(position.activeUntil, 'yyyy-MM-dd', 'en'));
                            }
                            this.positionForm.get('active')?.setValue(position.active);
                            this.setMarketplace();
                            this.setCurrency();
                        }
                    });
            } else {
                this.position = PositionCreator.createNewPosition();
                this.positionForm.get('activeFrom')?.setValue(formatDate(this.position.activeFrom, 'yyyy-MM-dd', 'en'));
                this.positionForm.get('active')?.setValue(this.position.active);
            }
        });
    }


    searchShare(event: any): void {
        this.selectableShares = [];
        if (event.target.value) {
            const searchString = event.target.value.toLowerCase();
            if (searchString.length > 2) {
                this.shareheadService.searchShare(searchString).subscribe(shares => {
                    if (shares) {
                        this.selectableShares = shares;
                    }
                });
            }
        }
    }


    selectShare(shareheadShare: ShareheadShare): void {
        this.selectedShare = shareheadShare;
        const share = ShareCreator.createNewShare();
        share.isin = shareheadShare.isin;
        share.name = shareheadShare.name;
        share.marketplace = shareheadShare.marketplace;
        this.selectableShares = [];
        this.positionForm.get('shareName')?.setValue(share.name);
        this.positionForm.get('shortName')?.setValue(share.name?.substring(0, 15));
        this.positionForm.get('isin')?.setValue(share.isin);
        this.position.share = share;
        this.position.shareheadId = share.id;
        if (share.marketplace?.currency) {
            const currency = this.currencyService.getCachedCurrencyByName(share.marketplace.currency);
            this.position.currency = currency;
        }
        this.setMarketplace();
        this.setCurrency();
    }

    onSubmit(): void {
        this.patchValuesBack(this.positionForm, this.position);
        if (this.bankAccountIndex !== undefined) {
            this.position.bankAccount = this.bankAccounts[this.bankAccountIndex];
        }
        if (this.motherPositionId > 0) {
            this.position.motherId = this.motherPositionId;
        }
        const newShare = ShareCreator.createNewShare();
        newShare.name = this.positionForm.get('shareName')?.value;
        newShare.shortname = this.positionForm.get('shortName')?.value;
        newShare.marketplace = this.positionForm.get('marketplace')?.value;
        newShare.isin = this.positionForm.get('isin')?.value;
        if (this.selectedShare) {
            this.position.shareheadId = this.selectedShare.id;
        }
        this.position.share = newShare;
        // console.log(this.position);
        if (this.position.id > 0) {
            this.positionService.update(this.position)
                .subscribe(position => {
                    if (position) {
                        this.portfolioService.portfolio?.replacePosition(position);
                    }
                    this.location.back();
                });
        } else {
            this.positionService.create(this.position)
                .subscribe(position => {
                    this.portfolioService.portfolio = undefined;
                    this.location.back();
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
        // todo: migrate this to use the kissquote-api
        this.shareheadService.getAllCurrencies()
            .subscribe(currencies => {
                this.currencies = currencies;
                this.setCurrency();
            });
        this.marketplaceService.getAllMarketplaces()
            .subscribe(places => {
                this.marketplaces = places;
                this.setMarketplace();
            });
    }


    private setCurrency(): void {
        // console.log('set currency');
        this.currencies.forEach(currency => {
            if (this.position.currency?.name === currency.name) {
                this.positionForm.get('currency')?.setValue(currency);
            }
        });
    }

    private setMarketplace(): void {
        this.marketplaces.forEach(marketplace => {
            if (this.position.share?.marketplace && this.position.share?.marketplace.id === marketplace.id) {
                this.positionForm.get('marketplace')?.setValue(marketplace);
            }
        });
    }
}
