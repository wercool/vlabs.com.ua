import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { QrScannerModule } from 'angular2-qrscanner';

import { QuillModule } from 'ngx-quill-wrapper';
import { QUILL_CONFIG } from 'ngx-quill-wrapper';
import { QuillConfigInterface } from 'ngx-quill-wrapper';

import { AppRoutingModule } from './module/routing.module';
import { MaterialModule } from './module/material.module';

import { DndModule } from 'ng2-dnd';

import { 
  TruncatePipe,
  CelementPipe
} from './pipes';

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
  AddCelementDialogComponent,
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
  ConfigService,
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
  SubscriptionService,
  FooService,
} from './service';

const DEFAULT_QUILL_CONFIG: QuillConfigInterface = {
  theme: 'snow',
  modules: {
    toolbar: true
  }
};

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
    EditEclassComponent,
    AddCelementDialogComponent,
    /* Pipes */
    TruncatePipe,
    CelementPipe
  ],
  /* Dialogs */
  entryComponents: [
    AuthUserDialogComponent,
    EditUserDialogComponent,
    AddCelementDialogComponent,
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
    QuillModule,
    QrScannerModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    DndModule.forRoot()
  ],
  providers: 
  [
    GuestGuard,
    AuthenticatedGuard,
    ManagerGuard,
    AdminGuard,
    ConfigService,
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
    SubscriptionService,
    FooService,
    {
      'provide': APP_INITIALIZER,
      'useFactory': initUserFactory,
      'deps': [UserService],
      'multi': true
    },
    {
      provide: QUILL_CONFIG,
      useValue: DEFAULT_QUILL_CONFIG
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
