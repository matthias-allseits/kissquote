import {FormControl, FormGroup} from '@angular/forms';


export class MotherFormComponent {

    formIsDirty = false;

    patchValuesBack(form: FormGroup, model: any): void {
        Object.keys(form.controls).map((field) => {
            const control = form.get(field);
            if (control instanceof FormControl) {
                if (typeof model[field] === 'number' && typeof control.value === 'string' && control.value.length > 0) {
                    model[field] = +control.value;
                } else {
                    model[field] = control.value;
                }
            } else if (control instanceof FormGroup) {
                this.patchValuesBack(control, model);
            }
        });
    }

}
