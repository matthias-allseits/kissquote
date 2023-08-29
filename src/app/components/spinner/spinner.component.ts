import { Component } from '@angular/core';
import {faEye} from "@fortawesome/free-solid-svg-icons/faEye";
import {faSpinner} from "@fortawesome/free-solid-svg-icons/faSpinner";

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent {

    protected readonly eyeIcon = faEye;
    protected readonly spinIcon = faSpinner;

}
