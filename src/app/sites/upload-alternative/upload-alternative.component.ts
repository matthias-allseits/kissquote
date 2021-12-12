import {Component, OnInit} from '@angular/core';
import {TranslationService} from '../../services/translation.service';

@Component({
    selector: 'app-upload-alternative',
    templateUrl: './upload-alternative.component.html',
    styleUrls: ['./upload-alternative.component.scss']
})
export class UploadAlternativeComponent implements OnInit {

    constructor(
        public tranService: TranslationService
    ) {
    }

    ngOnInit(): void {
    }

}
