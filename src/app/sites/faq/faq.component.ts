import {Component, OnInit} from '@angular/core';


@Component({
    selector: 'app-faq',
    templateUrl: './faq.component.html',
    styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {

    public questions = [
        {
            question: 'Question 1',
            answer: 'Everything here is extremely useful and will be a lifechanger for you.',
            show: true,
        },
        {
            question: 'Question 2',
            answer: 'Everything here is extremely useful and will be a lifechanger for you.',
            show: false,
        },
        {
            question: 'Question 3',
            answer: 'Everything here is extremely useful and will be a lifechanger for you.',
            show: false,
        },
        {
            question: 'Question 4',
            answer: 'Everything here is extremely useful and will be a lifechanger for you.',
            show: false,
        },
    ];

    constructor() {
    }

    ngOnInit(): void {
    }

    toggleAccordion(entry): void {
        this.questions.forEach((question) => {
            question.show = false;
            if (entry === question) {
                question.show = true;
            }
        });
    }

}
