import { NgModule } from '@angular/core';
import { ApiService } from '../service/api.service';
import { UserService } from '../service/user.service';

@NgModule({
  providers:
  [
    ApiService,
    UserService
  ],
  declarations: []
})
export class ServiceModule { }