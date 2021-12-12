import {Component, OnInit} from '@angular/core';
import {TranslationService} from '../../services/translation.service';


@Component({
    selector: 'app-landingpage',
    templateUrl: './landingpage.component.html',
    styleUrls: ['./landingpage.component.scss']
})
export class LandingpageComponent implements OnInit {

    constructor(
        public tranService: TranslationService
    ) {
    }

    ngOnInit(): void {
    }

}
