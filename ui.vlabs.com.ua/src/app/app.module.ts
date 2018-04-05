import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';

import { FileUploadModule } from 'ng2-file-upload';

import { QuillModule } from 'ngx-quill-wrapper';
import { QUILL_CONFIG } from 'ngx-quill-wrapper';
import { QuillConfigInterface } from 'ngx-quill-wrapper';

import { AppRoutingModule } from './module/routing.module';
import { MaterialModule } from './module/material.module';

import { DndModule } from 'ng2-dnd';
import { ClipboardModule } from 'ng2-clipboard';

import { 
  TruncatePipe,
  CelementPipe,
  SafeURLPipe
} from './pipes';

/* Guards */
import {
  GuestGuard,
  AuthenticatedGuard,
  ManagerGuard,
  CollaboratorGuard,
  AdminGuard
} from './guard';

/* Components */
import { AppComponent } from './app.component';
import {
  HeaderComponent,

  HomeComponent,
  AdminHomeComponent,
  UserHomeComponent,
  ManagerHomeComponent,
  CollaboratorHomeComponent,

  NotFoundComponent,
  LoginComponent,
  RegisterComponent,
  EditProfileComponent,
  ResetPasswordComponent,
  UserSidenavComponent,
  CollaboratorSidenavComponent,
  ManagerSidenavComponent,

  VlabsManagementComponent,
  NewVlabComponent,
  EditVLabComponent,
  AddVLabItemDialogComponent,

  CourseManagementComponent,
  NewCourseComponent,
  EditCourseComponent,
  AddCourseEClassDialogComponent,

  DepartmentManagementComponent,
  NewDepartmentComponent,
  EclassManagementComponent,
  NewEclassComponent,
  EditEclassComponent,
  AddCelementDialogComponent,
  ConfirmationDialog,

  FacultyManagementComponent,
  NewFacultyComponent,
  EditFacultyComponent,
  AddFacultyGroupDialogComponent,

  GroupManagementComponent,
  NewGroupComponent,
  EditGroupComponent,
  AddGroupMemberDialogComponent,

  ModuleManagementComponent,
  NewModuleComponent,
  EditPropertyDialogComponent,
  AdminSidenavComponent,
  UserManagementComponent,
  AuthUserDialogComponent,
  EditUserDialogComponent,

  PartnerManagementComponent,
  NewPartnerComponent,

  CollaboratorManagementComponent,
  NewCollaboratorComponent,
  EditCollaboratorComponent,
  CollaboratorProjectManagementComponent,
  NewCollaboratorProjectComponent,
  AddCollaboratorProjectDialogComponent,

  CollaboratorProjectActivityManagementComponent,
  AddCollaboratorProjectWorkItemDialogComponent,
  CollaboratorWorkItemActivityComponent,

  CElementItemComponent,
  CelementLabelComponent,
  CelementQuizComponent,
  CelementYoutubeComponent,
  CelementVLabComponent,
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
  CElementService,
  FacultyService,
  GroupService,
  ModuleService,
  PartnerService,
  SubscriptionService,
  CollaboratorService,
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
    /* Pipes */
    TruncatePipe,
    CelementPipe,
    SafeURLPipe,
    /* Component */
    AppComponent,
    HeaderComponent,

    HomeComponent,
    AdminHomeComponent,
    UserHomeComponent,
    ManagerHomeComponent,
    CollaboratorHomeComponent,

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
    CollaboratorSidenavComponent,
    ResetPasswordComponent,

    VlabsManagementComponent,
    NewVlabComponent,
    EditVLabComponent,
    AddVLabItemDialogComponent,

    CourseManagementComponent,
    NewCourseComponent,
    EditCourseComponent,
    AddCourseEClassDialogComponent,

    DepartmentManagementComponent,
    EclassManagementComponent,

    FacultyManagementComponent,
    NewFacultyComponent,
    EditFacultyComponent,
    AddFacultyGroupDialogComponent,

    GroupManagementComponent,
    NewGroupComponent,
    EditGroupComponent,
    AddGroupMemberDialogComponent,

    ModuleManagementComponent,

    PartnerManagementComponent,
    NewPartnerComponent,

    CollaboratorManagementComponent,
    NewCollaboratorComponent,
    EditCollaboratorComponent,
    CollaboratorProjectManagementComponent,
    NewCollaboratorProjectComponent,
    AddCollaboratorProjectDialogComponent,

    CollaboratorProjectActivityManagementComponent,
    AddCollaboratorProjectWorkItemDialogComponent,
    CollaboratorWorkItemActivityComponent,

    NewModuleComponent,
    NewDepartmentComponent,
    NewEclassComponent,
    EditEclassComponent,
    AddCelementDialogComponent,
    EditPropertyDialogComponent,
    ConfirmationDialog,
    CElementItemComponent,
    CelementLabelComponent,
    CelementQuizComponent,
    CelementYoutubeComponent,
    CelementVLabComponent,
  ],
  /* Dialogs */
  entryComponents: [
    AuthUserDialogComponent,
    EditUserDialogComponent,
    AddCelementDialogComponent,
    EditPropertyDialogComponent,
    ConfirmationDialog,
    AddVLabItemDialogComponent,
    AddGroupMemberDialogComponent,
    AddFacultyGroupDialogComponent,
    AddCourseEClassDialogComponent,
    AddCollaboratorProjectDialogComponent,
    AddCollaboratorProjectWorkItemDialogComponent,
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
    FileUploadModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    DndModule.forRoot(),
    ClipboardModule
  ],
  providers: 
  [
    GuestGuard,
    AuthenticatedGuard,
    CollaboratorGuard,
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
    CElementService,
    FacultyService,
    GroupService,
    ModuleService,
    PartnerService,
    CollaboratorService,
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
