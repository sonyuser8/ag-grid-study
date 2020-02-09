import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { AgGridAngular } from 'ag-grid-angular';
import { Column } from 'ag-grid-community/dist/lib/entities/column';
import { of } from 'rxjs';
import { Observable, Observer } from 'rxjs';
import { catchError, tap, concatMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

import * as socketIo from 'socket.io-client';
import { Socket } from './shared/interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('agGrid', { static: true }) agGrid: AgGridAngular;
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    // getQuotes() : Observable < number > {
    //   this.socket = socketIo('http://localhost:8080');
    //   this.socket.on('data', (res) => {
    //     this.observer.next(res.data);
    //   });
    //   return this.createObservable();
    // }
    document.addEventListener('paste', (e: ClipboardEvent) => {
      if (this.agGrid.api.getEditingCells().length === 0) {
        // tslint:disable-next-line: no-unused-expression
        this.isEditable ? this.paste(e) : null;
        // e.preventDefault();
        e.stopPropagation();
      }
    });
  }

  isEditable = false;
  observer;
  socket;
  isProcessing = false;
  title = 'app';
  defaultColDef = {
    sortable: true,
    filter: true,
    editable: (node) => {
      return this.isEditable;
    },
    resizable: true
  };
  columnDefs = [
    // { headerName: '', field: '', width: 40, sortable: false, filter: false, checkboxSelection: true, headerCheckboxSelection: true },
    { headerName: '', field: '', width: 40, sortable: false, filter: false },
    { headerName: 'Make', field: 'make' },
    { headerName: 'Model', field: 'model' },
    { headerName: 'Price', field: 'price' }
  ];
  rowData = [
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Porsche', model: 'Boxter', price: 72000 }
  ];
  rowData2 = [
    { make: 'Toyota2', model: 'Celica2', price: 350002 },
  ];
  data;
  streaming$;
  ngOnInit() {
    // this.streaming$ = this.http.get('http://localhost:8080/getFab', { responseType: 'text' });
    // this.streaming$ = this.http.get('http://localhost:8080/streaming', { responseType: 'text' });
    this.streaming$ = this.http.get('http://localhost:8080/streaming',
      { responseType: 'text', reportProgress: true, observe: 'events' }).pipe(
        concatMap(event => {
          console.log('CKPT1');
          this.data = event['partialText'];
          console.log(event);
          console.log('CKPT2');
          return of();
        })
      ).subscribe();
  }
  getQuotes(): Observable<string> {
    this.socket = socketIo('http://localhost:8080/streaming');
    this.socket.on('data', (res) => {
      this.observer.next(res.data);
    });
    return this.createObservable();
  }

  createObservable(): Observable<string> {
    return new Observable(observer => {
      this.observer = observer;
    });
  }

  isRowSelectable(node) {
    // if (node.data['make'] == 'Toyota') {
    //   return true;
    // } else {
    //   return false;
    // }'
    return true;
  }


  toggleEdit() {
    this.isEditable = !this.isEditable;
    const columnDefs: object[] = this.agGrid.columnDefs;
    columnDefs[0]['checkboxSelection'] = this.isEditable;
    columnDefs[0]['headerCheckboxSelection'] = this.isEditable;
    this.agGrid.api.setColumnDefs(columnDefs);
  }

  updateTbl() {
    this.agGrid.api.setRowData(this.rowData2);
  }

  onClick() {
    this.http.get<HttpResponse<string>>('http://localhost:8080/getFab').pipe(
      catchError(error => {
        return of(error);
      })
    ).subscribe(

    );
  }

  saveSelectedRows() {
    const api = this.agGrid.api;
    api.forEachNode((rowNode, index) => {
      // console.log('node:', rowNode.data);
    });
    const selectedNodes = this.agGrid.api.getSelectedNodes();
    const selectedData = selectedNodes.map(node => {
      console.log('selected node.data:', node.data);
      return node.data;
    });
    this.isProcessing = true;
    this.http.post('http://localhost:8080/test', selectedData).pipe(
      catchError(error => {
        return of(error);
      })).subscribe(
        resp => {
          this.isProcessing = false;
          if (resp instanceof HttpErrorResponse) {
            // console.log('CKPT1:', resp);
            this.openSnackBar(`Error!!! ${resp.error.message}`, 'Save Data', 8000);
          } else {
            this.openSnackBar('Success!', 'Save Data', 1000);
          }
        });
  }

  paste(e) {
    const data: string = e.clipboardData.getData('Text').trim();
    // get cols
    const colsRaw = this.agGrid.columnApi.getAllColumns().splice(1); // skip check box
    const cols = colsRaw.map(v => (v as Column).getColId());

    const newData = [];
    data.split('\n').forEach(
      v => {
        newData.push(this.createNewRow(cols, v));
      });
    this.agGrid.api.updateRowData({ add: newData }); // append pasted data
  }

  createNewRow(cols: string[], rawData) {
    const result = {};
    let idx = 0;
    rawData.split('\t').forEach(
      v => {
        result[cols[idx++]] = v;
      });
    return result;
  }
  clearTableRowData() {
    this.agGrid.api.setRowData([]);
  }
  openSnackBar(message: string, action: string, time: number) {
    this.snackBar.open(message, action, {
      duration: time,
      verticalPosition: 'top'
    });
  }

}


