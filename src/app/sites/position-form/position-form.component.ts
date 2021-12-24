import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, Params} from '@angular/router';
import {PositionService} from '../../services/position.service';
import {Position} from '../../models/position';
import {ShareService} from '../../services/share.service';
import {Share} from '../../models/share';
import {CurrencyService} from '../../services/currency.service';
import {Currency} from '../../models/currency';


@Component({
    selector: 'app-position-form',
    templateUrl: './position-form.component.html',
    styleUrls: ['./position-form.component.scss']
})
export class PositionFormComponent implements OnInit {

    public position: Position;
    public shares: Share[];
    public currencies: Currency[];

    positionForm = new FormGroup({
        share: new FormControl(''),
        currency: new FormControl(''),
    });

    constructor(
        private route: ActivatedRoute,
        private positionService: PositionService,
        private shareService: ShareService,
        private currencyService: CurrencyService,
    ) {
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
                            this.positionForm.patchValue(position, { onlySelf: true });
                            // this.positionForm.get('shareName').setValue(position.share.name);
                            // this.positionForm.get('currencyName').setValue(position.currency.name);
                        }
                    );
            } else {
                this.position = new Position(null, null, null, false);
            }
        });
    }


    onSubmit(): void {
        // TODO: Use EventEmitter with form value
        console.warn(this.positionForm.value);
    }


    private loadData(): void {
        this.shareService.getAllShares()
            .subscribe(shares => {
                    console.log(shares);
                    this.shares = shares;
                }
            );
        this.currencyService.getAllCurrencies()
            .subscribe(currencies => {
                    console.log(currencies);
                    this.currencies = currencies;
                }
            );
    }

}