import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from "@ngx-translate/http-loader";

import { AppRoutingModule } from './module/routing.module';
import { MaterialModule } from './module/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

/* Guards */
import {
  GuestGuard,
  AuthenticatedGuard,
  AdminGuard
} from './guard';

/* Components */
import { AppComponent } from './app.component';
import {
  HeaderComponent,
  HomeComponent,
  AdminHomeComponent,
  UserHomeComponent,
  NotFoundComponent,
  LoginComponent,
  RegisterComponent,
  /* authenticated user components */
  EditProfileComponent,
  ResetPasswordComponent,
  /* ROLE_USER components */
  UserSidenavComponent,
  /* ROLE_MANAGER components */
  ManagerSidenavComponent,
  /* ROLE_ADMIN components */
  AdminSidenavComponent,
  UserManagementComponent,
  AuthUserDialogComponent,
  EditUserDialogComponent,
} from './component';

/* Services */
import {
  ApiService,
  AuthService,
  UserService,
  FooService,
  ConfigService
} from './service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';

export function initUserFactory(userService: UserService)
{
    return () => userService.initUser();
}

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, "translations/", ".json");
}

@NgModule({
  declarations:
  [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    AdminHomeComponent,
    UserHomeComponent,
    NotFoundComponent,
    LoginComponent,
    RegisterComponent,
    AdminHomeComponent,
    UserManagementComponent,
    AuthUserDialogComponent,
    AdminSidenavComponent,
    UserSidenavComponent,
    EditProfileComponent,
    EditUserDialogComponent,
    ManagerSidenavComponent,
    ResetPasswordComponent,
  ],
  entryComponents: [
    AuthUserDialogComponent,
    EditUserDialogComponent,
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
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: 
  [
    GuestGuard,
    AuthenticatedGuard,
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
