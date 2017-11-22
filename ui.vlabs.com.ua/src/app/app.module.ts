import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './module/routing.module';
import { MaterialModule } from './module/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

/* Guards */
import {
  GuestGuard,
  AdminGuard
} from './guard';

/* Components */
import { AppComponent } from './app.component';
import {
  HeaderComponent,
  AdminMenuComponent,
  HomeComponent,
  AdminHomeComponent,
  UserHomeComponent,
  NotFoundComponent,
  LoginComponent,
  RegisterComponent,
  /* ROLE_ADMIN components */
  UserManagementComponent
} from './component';

/* Services */
import {
  ApiService,
  AuthService,
  UserService,
  FooService,
  ConfigService
} from './service';

export function initUserFactory(userService: UserService)
{
    return () => userService.initUser();
}

@NgModule({
  declarations:
  [
    AppComponent,
    HeaderComponent,
    AdminMenuComponent,
    HomeComponent,
    AdminHomeComponent,
    UserHomeComponent,
    NotFoundComponent,
    LoginComponent,
    RegisterComponent,
    AdminMenuComponent,
    AdminHomeComponent,
    UserManagementComponent
  ],
  imports:
  [
    MaterialModule,
    BrowserAnimationsModule,
    BrowserModule,
    HttpModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: 
  [
    GuestGuard,
    AdminGuard,
    ConfigService,
    ApiService,
    FooService,
    AuthService,
    UserService,
    {
      'provide': APP_INITIALIZER,
      'useFactory': initUserFactory,
      'deps': [UserService],
      'multi': true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
