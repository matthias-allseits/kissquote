import {Component} from '@angular/core';
import {TranslationService} from "../../services/translation.service";


@Component({
    selector: 'app-landingpage-opensource',
    templateUrl: './landingpage-opensource.component.html',
    styleUrls: ['./landingpage-opensource.component.scss']
})
export class LandingpageOpensourceComponent {

    constructor(
        public tranService: TranslationService
    ) {
    }

    ngOnInit(): void {
    }

}
