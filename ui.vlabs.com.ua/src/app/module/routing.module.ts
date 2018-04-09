import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from '../app.component';
import {
  HomeComponent,
  LoginComponent,
  RegisterComponent,
  NotFoundComponent,
  EditProfileComponent,
  ResetPasswordComponent,

  UserManagementComponent,

  VlabsManagementComponent,
  EditVLabComponent,

  CourseManagementComponent,
  EditCourseComponent,

  FacultyManagementComponent,
  EditFacultyComponent,

  DepartmentManagementComponent,

  GroupManagementComponent,
  EditGroupComponent,

  PartnerManagementComponent,

  CollaboratorManagementComponent,

  ModuleManagementComponent,

  EclassManagementComponent,
  EditEclassComponent,
  EditCollaboratorComponent,
  CollaboratorProjectManagementComponent,
  CollaboratorProjectActivityManagementComponent,
  CollaboratorWorkItemActivityComponent,
  CollabortatorWorkItemsTableComponent,
} from '../component';

import {
  GuestGuard,
  AuthenticatedGuard,
  AdminGuard,
  ManagerGuard,
  CollaboratorGuard,
  CollaboratorManagerGuard
} from '../guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [GuestGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [GuestGuard]
  },
  {
    path: 'register/collaborator/:collaboratorId',
    component: RegisterComponent,
    canActivate: [GuestGuard]
  },
  {
    path: 'edit-profile',
    component: EditProfileComponent,
    canActivate: [AuthenticatedGuard]
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    canActivate: [AuthenticatedGuard]
  },
  {
    path: 'vlabs-management',
    component: VlabsManagementComponent,
    canActivate: [ManagerGuard]
  },
  {
    path: 'vlab-edit/:id',
    component: EditVLabComponent,
    canActivate: [ManagerGuard]
  },
  {
    path: 'course-management',
    component: CourseManagementComponent,
    canActivate: [ManagerGuard]
  },
  {
    path: 'course-edit/:id',
    component: EditCourseComponent,
    canActivate: [ManagerGuard]
  },
  {
    path: 'modules-management',
    component: ModuleManagementComponent,
    canActivate: [ManagerGuard]
  },
  {
    path: 'department-management',
    component: DepartmentManagementComponent,
    canActivate: [ManagerGuard]
  },
  {
    path: 'faculty-management',
    component: FacultyManagementComponent,
    canActivate: [ManagerGuard]
  },
  {
    path: 'faculty-edit/:id',
    component: EditFacultyComponent,
    canActivate: [ManagerGuard]
  },
  {
    path: 'group-management',
    component: GroupManagementComponent,
    canActivate: [ManagerGuard]
  },
  {
    path: 'group-edit/:id',
    component: EditGroupComponent,
    canActivate: [ManagerGuard]
  },
  {
    path: 'eclass-management',
    component: EclassManagementComponent,
    canActivate: [ManagerGuard]
  },
  {
    path: 'eclass-edit/:id',
    component: EditEclassComponent,
    canActivate: [ManagerGuard]
  },
  {
    path: 'user-management',
    component: UserManagementComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'partner-management',
    component: PartnerManagementComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'collaborator-management',
    component: CollaboratorManagementComponent,
    canActivate: [CollaboratorManagerGuard]
  },
  {
    path: 'collaborator-project-management',
    component: CollaboratorProjectManagementComponent,
    canActivate: [CollaboratorManagerGuard]
  },
  {
    path: 'collaborator-edit/:id',
    component: EditCollaboratorComponent,
    canActivate: [CollaboratorManagerGuard]
  },
  {
    path: 'collaborator/project-activity-management/:id',
    component: CollaboratorProjectActivityManagementComponent,
    canActivate: [CollaboratorGuard]
  },
  {
    path: 'collaborator/work-item-activity/:id',
    component: CollaboratorWorkItemActivityComponent,
    canActivate: [CollaboratorGuard]
  },
  {
    path: 'collaborator-work-items-table',
    component: CollabortatorWorkItemsTableComponent,
    canActivate: [CollaboratorManagerGuard]
  },

  /* Service */
  {
    path: '404',
    component: NotFoundComponent
  },
  {
    path: '**',
    redirectTo: '/404'
  }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: []
})

export class AppRoutingModule { }
