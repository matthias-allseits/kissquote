import {Component, OnInit} from '@angular/core';
import {TranslationService} from '../../services/translation.service';

@Component({
    selector: 'app-upload-explanation',
    templateUrl: './upload-explanation.component.html',
    styleUrls: ['./upload-explanation.component.scss']
})
export class UploadExplanationComponent implements OnInit {

    constructor(
        public tranService: TranslationService
    ) {
    }

    ngOnInit(): void {
    }

}
