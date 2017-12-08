import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from "@ngx-translate/http-loader";

import { AppRoutingModule } from './module/routing.module';
import { MaterialModule } from './module/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';

/* Guards */
import {
  GuestGuard,
  AuthenticatedGuard,
  ManagerGuard,
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
  VlabsManagementComponent,
  NewVlabComponent,
  CourseManagementComponent,
  NewCourseComponent,
  DepartmentManagementComponent,
  NewDepartmentComponent,
  EclassManagementComponent,
  NewEclassComponent,
  EditEclassComponent,
  FacultyManagementComponent,
  NewFacultyComponent,
  GroupManagementComponent,
  NewGroupComponent,
  ModuleManagementComponent,
  NewModuleComponent,
  /* ROLE_ADMIN components */
  AdminSidenavComponent,
  UserManagementComponent,
  AuthUserDialogComponent,
  EditUserDialogComponent,
  PartnerManagementComponent,
  NewPartnerComponent,
} from './component';

/* Services */
import {
  ApiService,
  AuthService,
  UserService,
  VlabService,
  CourseService,
  DepartmentService,
  EClassService,
  FacultyService,
  GroupService,
  ModuleService,
  PartnerService,
  FooService,
  ConfigService
} from './service';

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { QrScannerModule, QrScannerComponent } from 'angular2-qrscanner';

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
    VlabsManagementComponent,
    NewVlabComponent,
    CourseManagementComponent,
    DepartmentManagementComponent,
    EclassManagementComponent,
    FacultyManagementComponent,
    GroupManagementComponent,
    ModuleManagementComponent,
    PartnerManagementComponent,
    NewCourseComponent,
    NewModuleComponent,
    NewPartnerComponent,
    NewDepartmentComponent,
    NewFacultyComponent,
    NewGroupComponent,
    NewEclassComponent,
    EditEclassComponent
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
    QrScannerModule,
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot(),
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
    ManagerGuard,
    AdminGuard,
    ConfigService,
    ApiService,
    FooService,
    AuthService,
    UserService,
    VlabService,
    CourseService,
    DepartmentService,
    EClassService,
    FacultyService,
    GroupService,
    ModuleService,
    PartnerService,
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
