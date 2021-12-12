import {Component, OnInit} from '@angular/core';
import {TranslationService} from '../../services/translation.service';

@Component({
    selector: 'app-demo',
    templateUrl: './demo.component.html',
    styleUrls: ['./demo.component.scss']
})
export class DemoComponent implements OnInit {

    constructor(
        public tranService: TranslationService
    ) {
    }

    ngOnInit(): void {
    }

}
