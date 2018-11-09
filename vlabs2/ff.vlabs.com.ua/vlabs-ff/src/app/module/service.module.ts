import { NgModule } from '@angular/core';
import { ApiService } from '../service/api.service';
import { AuthService } from '../service/auth.service';
import { UserService } from '../service/user.service';
import { VLabWebSocketManagerService } from '../service/vlab.websocket.manager.service';

@NgModule({
  providers:
  [
    ApiService,
    AuthService,
    UserService,
    VLabWebSocketManagerService
  ],
  declarations: []
})
export class ServiceModule { }