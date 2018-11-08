import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.css']
})
export class WorkspaceComponent implements OnInit {

    constructor(
        private authService: AuthService
    ) {
    }

    ngOnInit() {
        this.authService.details()
        .then((details) => {
            console.log(details);
        });
    }

}