import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { MaterialModule } from './module/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { HttpModule } from '@angular/http';

import { ServiceModule } from './module/service.module';
import { RoutingModule } from './module/routing.module';
import { GuardModule } from './module/guard.module';

import { ApiService, AuthService, UserService } from './service';

import { AppComponent } from './app.component';
import { LoginComponent } from './component/login/login.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { CompatibilityTestComponent } from './component/compatibility-test/compatibility-test.component';
import { HomeComponent } from './component/home/home.component';
import { ProfileComponent } from './component/profile/profile.component';
import { ResetPasswordComponent } from './component/profile/reset-password/reset-password.component';
import { CoursesComponent } from './component/courses/courses.component';
import { HelpClipsComponent } from './component/helpclips/helpclips.component';
import { HelpClipsMarketComponent } from './component/helpclips-market/helpclips-market.component';
import { HelpClipComponent } from './component/helpclip/helpclip.component';
import { NotFoundComponent } from './component/not-found/not-found.component';

export function initUserFactory(userService: UserService)
{
    return () => userService.initUser();
}

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    LoginComponent,
    DashboardComponent,
    CompatibilityTestComponent,
    HomeComponent,
    ProfileComponent,
    ResetPasswordComponent,
    CoursesComponent,
    HelpClipsComponent,
    HelpClipsMarketComponent,
    HelpClipComponent
  ],
  imports: [
    MaterialModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    GuardModule,
    ServiceModule,
    RoutingModule
  ],
  providers: [
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
