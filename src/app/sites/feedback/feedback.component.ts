import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-feedback',
    templateUrl: './feedback.component.html',
    styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {

    public activeMood: string;
    public placeholder = '';

    constructor() {
    }

    ngOnInit(): void {
        this.changeMood('bad');
    }


    changeMood(mood: string): void
    {
        this.activeMood = mood;
        switch (mood) {
            case 'bad':
                this.placeholder = 'Der Programmator dieser bunten Webseiten möge an seinem Kot ersticken!';
                break;
            case 'medium':
                this.placeholder = 'Ist ja ganz nett hier, aber ich fühle mich in meiner Meinung bestärkt, dass künftig für die Erstellung neuer bunter Webseiten ein Baugesuch gestellt werden sollte.';
                break;
            case 'good':
                this.placeholder = 'Wir werden unseren Erstgeborenen ' + 'Kissquote' + ' nennen.';
                break;
        }
    }

}
