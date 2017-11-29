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
  /* ADMIN role component */
  UserManagementComponent,
} from '../component';

import {
  GuestGuard,
  AuthenticatedGuard,
  AdminGuard
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
  /* ADMIN role routes */
  {
    path: 'user-management',
    component: UserManagementComponent,
    canActivate: [AdminGuard]
  },
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
