import {Component, OnInit} from '@angular/core';
import {TranslationService} from '../../services/translation.service';


@Component({
    selector: 'app-more-info',
    templateUrl: './more-info.component.html',
    styleUrls: ['./more-info.component.scss']
})
export class MoreInfoComponent implements OnInit {

    constructor(
        public translationService: TranslationService
    ) {
    }

    ngOnInit(): void {
    }

}
