import { Component } from '@angular/core';
import {faSpinner} from "@fortawesome/free-solid-svg-icons/faSpinner";


@Component({
    selector: 'app-spinner-relative',
    templateUrl: './spinner-relative.component.html',
    styleUrls: ['./spinner-relative.component.scss']
})
export class SpinnerRelativeComponent {

    protected readonly spinIcon = faSpinner;

}
