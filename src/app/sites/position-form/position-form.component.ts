import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';


@Component({
    selector: 'app-position-form',
    templateUrl: './position-form.component.html',
    styleUrls: ['./position-form.component.scss']
})
export class PositionFormComponent implements OnInit {

    positionForm = new FormGroup({
        shareName: new FormControl(''),
        currencyName: new FormControl(''),
    });

    constructor() {
    }

    ngOnInit(): void {
    }

    onSubmit(): void {
        // TODO: Use EventEmitter with form value
        console.warn(this.positionForm.value);
    }

}
