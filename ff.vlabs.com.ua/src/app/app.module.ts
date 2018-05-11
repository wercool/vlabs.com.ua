import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { MaterialModule } from './module/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { HttpModule } from '@angular/http';

import { ServiceModule } from './module/service.module';
import { AppRoutingModule } from './module/routing.module';

import { AppComponent } from './app.component';
import { LoginComponent } from './component/login/login.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { CompatibilityTestComponent } from './component/compatibility-test/compatibility-test.component';
import { HomeComponent } from './component/home/home.component';
import { ApiService, AuthService, UserService } from './service';

export function initUserFactory(userService: UserService)
{
    return () => userService.initUser();
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    CompatibilityTestComponent,
    HomeComponent
  ],
  imports: [
    MaterialModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    ServiceModule,
    AppRoutingModule
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
