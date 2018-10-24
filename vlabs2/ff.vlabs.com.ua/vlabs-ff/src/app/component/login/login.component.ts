import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AuthService } from "src/app/service/auth.service";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
  })
  export class LoginComponent implements OnInit {

    form: FormGroup;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private authService: AuthService,
        private formBuilder: FormBuilder,
    ) { }

    ngOnInit(): void {
        this.form = this.formBuilder.group({
            username: ['', Validators.compose([Validators.required, Validators.email])],
            password: ['']
        });
    }

    onSubmit() {
        this.authService.authAttempt(this.form.value)
        .subscribe(
            result => {
                console.log(result);
            },
            error => { }
        );
    }
}