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


@Component({
    selector: 'app-position-form',
    templateUrl: './position-form.component.html',
    styleUrls: ['./position-form.component.scss']
})
export class PositionFormComponent extends MotherFormComponent implements OnInit {

    public position: Position;
    public shares: Share[] = [];
    public shareHeadShares: Share[] = [];
    public currencies: Currency[] = [];

    positionForm = new FormGroup({
        share: new FormControl(''),
        currency: new FormControl(''),
    });

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private positionService: PositionService,
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
            const positionId = +params['id'];
            if (positionId) {
                this.positionService.getPosition(positionId)
                    .subscribe(position => {
                        console.log(position);
                        if (position instanceof Position) {
                            this.position = position;
                        }
                        // this.positionForm.patchValue(position, { onlySelf: true });
                    });
            } else {
                this.position = PositionCreator.createNewPosition();
            }
        });
    }

    onSubmit(): void {
        this.patchValuesBack(this.positionForm, this.position);
        console.log(this.position);
        if (this.position.id > 0) {
            this.positionService.update(this.position)
                .subscribe(account => {
                    this.router.navigate(['my-dashboard']);
                });
        } else {
            this.positionService.create(this.position)
                .subscribe(account => {
                    this.router.navigate(['my-dashboard']);
                });
        }
    }


    private loadData(): void {
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
        this.currencyService.getAllCurrencies()
            .subscribe(currencies => {
                console.log(currencies);
                this.currencies = currencies;
            });
    }

}
