import {Component, OnInit} from '@angular/core';
import {TranslationService} from '../../services/translation.service';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {FeedbackService} from "../../services/feedback.service";
import {Feedback} from "../../models/feedback";
import {Location} from "@angular/common";


@Component({
    selector: 'app-feedback',
    templateUrl: './feedback.component.html',
    styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {

    public activeMood = 'bad';
    public placeholder = '';
    public submitText = '';

    feedbackForm = new FormGroup({
        feedback: new FormControl('', Validators.required),
    });

    constructor(
        public tranService: TranslationService,
        public feedbackService: FeedbackService,
        private location: Location,
    ) { }

    ngOnInit(): void {
        this.changeMood('bad');
    }


    changeMood(mood: string): void
    {
        this.activeMood = mood;
        switch (mood) {
            case 'bad':
                this.placeholder = 'Der Programmator dieser bunten Webseiten möge an seinem Code ersticken!';
                this.submitText = 'Take that!';
                break;
            case 'medium':
                this.placeholder = 'Ist ja ganz nett hier, aber ich fühle mich in meiner Meinung bestärkt, dass künftig für die Erstellung neuer bunter Webseiten ein Baugesuch gestellt werden sollte.';
                this.submitText = 'Submit';
                break;
            case 'good':
                this.placeholder = 'Wir werden unseren Erstgeborenen ' + 'Kissquote' + ' nennen.';
                this.submitText = 'Send my kiss';
                break;
        }
    }

    submitFeedback(): void {
        console.log(this.feedbackForm.get('feedback')?.value);
        const feedback = new Feedback(0, this.activeMood, this.feedbackForm.get('feedback')?.value);
        this.feedbackService.post(feedback)
            .subscribe(feedback => {
                this.location.back();
            });
    }

}
