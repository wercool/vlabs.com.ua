import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from './module/material.module';
import { RoutingModule } from './module/routing.module';
import { ServiceModule } from './module/service.module';
import { GuardModule } from './module/guard.module';

import { SafeURLPipe } from './pipe/safe.url.pipe';

import { AppComponent } from './app.component';
import { HomeComponent } from './component/home/home.component';
import { LoginComponent } from './component/login/login.component';
import { WorkspaceComponent } from './component/workspace/workspace.component';
import { VLabComponent } from './component/vlab/vlab.component';
import { NotFoundComponent } from './component/not-found/not-found.component';

@NgModule({
  declarations: [
    /**
     * VLabs FF components
     */
    AppComponent,
    HomeComponent,
    LoginComponent,
    WorkspaceComponent,
    VLabComponent,
    NotFoundComponent,
    /**
     * Service declarations
     */
    SafeURLPipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    GuardModule,
    RoutingModule,
    ServiceModule
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
