import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, Params} from '@angular/router';
import {PositionService} from '../../services/position.service';
import {Position} from '../../models/position';


@Component({
    selector: 'app-position-form',
    templateUrl: './position-form.component.html',
    styleUrls: ['./position-form.component.scss']
})
export class PositionFormComponent implements OnInit {

    public position: Position;
    positionForm = new FormGroup({
        shareName: new FormControl(''),
        currencyName: new FormControl(''),
    });

    constructor(
        private route: ActivatedRoute,
        private positionService: PositionService,
    ) {
    }

    ngOnInit(): void {
        this.route.params.subscribe((params: Params) => {
            const positionId = +params['id'];
            console.log(positionId);
            this.positionService.getPosition(positionId)
                .subscribe(position => {
                    console.log(position);
                    this.position = position;
                    this.positionForm.patchValue(position, { onlySelf: true });
                    this.positionForm.get('shareName').setValue(position.share.name);
                    this.positionForm.get('currencyName').setValue(position.currency.name);
                }
            );
        });
    }

    onSubmit(): void {
        // TODO: Use EventEmitter with form value
        console.warn(this.positionForm.value);
    }

}
