import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AuthService } from "src/app/service/auth.service";
import { delay } from "q";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
  })
  export class LoginComponent implements OnInit {

    form: FormGroup;
    submitted: boolean = false;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private authService: AuthService,
        private formBuilder: FormBuilder,
    ) { }

    ngOnInit(): void {
        this.form = this.formBuilder.group({
            username: ['', Validators.compose([Validators.required, Validators.email])],
            password: ['', Validators.compose([Validators.required])]
        });
    }

    onSubmit() {
        if (!this.form.valid) return;
        this.submitted = true;
        this.authService
        .authenticate(this.form.value)
        .then(result => {
            console.log(result);
            this.submitted = false;
            this.form.reset();
        })
        .catch((error) => {
            this.submitted = false;
            console.warn('TODO: handle error', error.status, error.statusText);
        });
    }
}