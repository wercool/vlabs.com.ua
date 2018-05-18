import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from "../component/dashboard/dashboard.component";
import { AuthenticatedGuard, HelpClipDeactivateGuard } from '../guard';
import { ProfileComponent } from '../component/profile/profile.component';
import { HelpClipComponent } from '../component/helpclip/helpclip.component';
import { HelpClipsComponent } from '../component/helpclips/helpclips.component';
import { HomeComponent } from '../component/home/home.component';
import { HelpClipsMarketComponent } from '../component/helpclips-market/helpclips-market.component';
import { NotFoundComponent } from '../component/not-found/not-found.component';
import { ResetPasswordComponent } from '../component/profile/reset-password/reset-password.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthenticatedGuard],
    },
    {
        path: 'helpclips',
        component: HelpClipsComponent,
        canActivate: [AuthenticatedGuard]
    },
    {
        path: 'helpclips-market',
        component: HelpClipsMarketComponent,
        canActivate: [AuthenticatedGuard]
    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthenticatedGuard]
    },
    {
        path: 'reset-password',
        component: ResetPasswordComponent,
        canActivate: [AuthenticatedGuard]
    },
    {
        path: 'helpclip/:alias',
        component: HelpClipComponent,
        canActivate: [AuthenticatedGuard],
        canDeactivate: [HelpClipDeactivateGuard]
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

export class RoutingModule { }