import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, Params} from '@angular/router';
import {PositionService} from '../../services/position.service';
import {Position} from '../../models/position';
import {ShareService} from '../../services/share.service';
import {Share} from '../../models/share';
import {CurrencyService} from '../../services/currency.service';
import {Currency} from '../../models/currency';
import {ShareheadService} from '../../services/sharehead.service';
import {MotherFormComponent} from '../mother-form.component';


@Component({
    selector: 'app-position-form',
    templateUrl: './position-form.component.html',
    styleUrls: ['./position-form.component.scss']
})
export class PositionFormComponent extends MotherFormComponent implements OnInit {

    public position: Position|null = null;
    public shares: Share[] = [];
    public shareHeadShares: Share[] = [];
    public currencies: Currency[] = [];

    positionForm = new FormGroup({
        share: new FormControl(''),
        currency: new FormControl(''),
    });

    constructor(
        private route: ActivatedRoute,
        private positionService: PositionService,
        private shareService: ShareService,
        private currencyService: CurrencyService,
        private shareheadService: ShareheadService,
    ) {
        super();
    }


    ngOnInit(): void {
        this.loadData();
        this.route.params.subscribe((params: Params) => {
            const positionId = +params['id'];
            if (positionId) {
                this.positionService.getPosition(positionId)
                    .subscribe(position => {
                        console.log(position);
                        this.position = position;
                        // this.positionForm.patchValue(position, { onlySelf: true });
                    });
            } else {
                this.position = new Position(0, null, null, false);
            }
        });
    }


    onSubmit(): void {
        this.patchValuesBack(this.positionForm, this.position);
        // TODO: Use EventEmitter with form value
        // console.warn(this.positionForm.value);
        console.warn(this.position);
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
