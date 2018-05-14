import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from "../component/dashboard/dashboard.component";
import { AuthenticatedGuard } from '../guard';
import { ProfileComponent } from '../component/profile/profile.component';
import { HelpClipComponent } from '../component/dashboard/help-clip/help-clip.component';

export const routes: Routes = [
    {
      path: 'dashboard',
      component: DashboardComponent,
      canActivate: [AuthenticatedGuard]
    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthenticatedGuard]
    },
    {
      path: 'help-clip/:help-clip-alias',
      component: HelpClipComponent,
      canActivate: [AuthenticatedGuard]
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: []
})

export class RoutingModule { }