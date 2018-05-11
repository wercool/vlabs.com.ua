import { NgModule } from '@angular/core';

import { ApiService, AuthService, UserService } from '../service';

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
