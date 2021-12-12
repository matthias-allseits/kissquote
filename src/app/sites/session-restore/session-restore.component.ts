import {Component, OnInit} from '@angular/core';
import {TranslationService} from '../../services/translation.service';

@Component({
    selector: 'app-session-restore',
    templateUrl: './session-restore.component.html',
    styleUrls: ['./session-restore.component.scss']
})
export class SessionRestoreComponent implements OnInit {

    constructor(
        public tranService: TranslationService
    ) {
    }

    ngOnInit(): void {
    }

}
