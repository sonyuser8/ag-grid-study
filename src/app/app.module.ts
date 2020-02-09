import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { AppComponent } from './app.component';
import { AgGridModule } from 'ag-grid-angular';
import { HttpClientModule } from '@angular/common/http';
import { DemoMaterialModule } from './material-module';
import 'ag-grid-enterprise';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    DemoMaterialModule,
    HttpClientModule,
    BrowserModule,
    AgGridModule.withComponents([]),
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
