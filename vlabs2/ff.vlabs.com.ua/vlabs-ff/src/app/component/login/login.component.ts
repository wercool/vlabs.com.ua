import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { ApiService } from "src/app/service/api.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

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
        private apiService: ApiService,
        private formBuilder: FormBuilder,
    ) { }

    ngOnInit(): void {
        this.form = this.formBuilder.group({
            username: ['', Validators.compose([Validators.required, Validators.email])],
            password: ['']
        });
    }

    onSubmit() {
    }
}