import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from '../app.component';
import {
  HomeComponent,
  LoginComponent,
  RegisterComponent,
  NotFoundComponent,
  /* authenticated user components */
  EditProfileComponent,
  ResetPasswordComponent,
  /* MANAGER role component */
  VlabsManagementComponent,
  CourseManagementComponent,
  DepartmentManagementComponent,
  FacultyManagementComponent,
  GroupManagementComponent,
  /* ADMIN role component */
  UserManagementComponent,
  PartnerManagementComponent,

  /* ADMIN, MANAGER role component */
  ModuleManagementComponent,
  EclassManagementComponent,
  EditEclassComponent,
} from '../component';

import {
  GuestGuard,
  AuthenticatedGuard,
  AdminGuard,
  ManagerGuard
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
  /* authenticated user role routes */
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
  /* MANAGER role routes */
  {
    path: 'vlabs-management',
    component: VlabsManagementComponent,
    canActivate: [ManagerGuard]
  },
  {
    path: 'course-management',
    component: CourseManagementComponent,
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
    path: 'group-management',
    component: GroupManagementComponent,
    canActivate: [ManagerGuard]
  },
  //EClasses
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
  /* ADMIN role routes */
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
