import { NgModule } from '@angular/core';
import { ApiService } from '../service/api.service';
import { AuthService } from '../service/auth.service';
import { UserService } from '../service/user.service';

@NgModule({
  providers:
  [
    ApiService,
    AuthService,
    UserService
  ],
  declarations: []
})
export class ServiceModule { }