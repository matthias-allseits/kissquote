import { Component } from '@angular/core';
import {faSpinner} from "@fortawesome/free-solid-svg-icons/faSpinner";


@Component({
    selector: 'app-spinner',
    templateUrl: './spinner.component.html',
    styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent {

    protected readonly spinIcon = faSpinner;

}
