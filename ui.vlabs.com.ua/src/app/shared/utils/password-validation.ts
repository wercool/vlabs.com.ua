import {AbstractControl} from '@angular/forms';
export class PasswordValidation {

    static MatchPassword(AC: AbstractControl) {
       let password = AC.get('password').value; // to get value in input tag
       let confirmPassword = AC.get('confirmPassword').value; // to get value in input tag
        if(password != confirmPassword) {
            // console.log('password entries do not match = false');
            AC.get('confirmPassword').setErrors( {MatchPassword: true} )
        } else {
            // console.log('password entries do match = true');
            return null
        }
    }

    static MatchNewPassword(AC: AbstractControl) {
        let password = AC.get('newPassword').value; // to get value in input tag
        let confirmPassword = AC.get('confirmNewPassword').value; // to get value in input tag
         if(password != confirmPassword) {
             // console.log('password entries do not match = false');
             AC.get('confirmNewPassword').setErrors( {MatchPassword: true} )
         } else {
             // console.log('password entries do match = true');
             return null
         }
     }
}