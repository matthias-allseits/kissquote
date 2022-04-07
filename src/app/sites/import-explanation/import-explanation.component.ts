import {Component, OnInit} from '@angular/core';
import {TranslationService} from '../../services/translation.service';

@Component({
    selector: 'app-import-explanation',
    templateUrl: './import-explanation.component.html',
    styleUrls: ['./import-explanation.component.scss']
})
export class ImportExplanationComponent implements OnInit {

    constructor(
        public tranService: TranslationService
    ) {
    }

    ngOnInit(): void {
    }

}
