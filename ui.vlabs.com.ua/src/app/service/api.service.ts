import { Injectable, Output, EventEmitter } from '@angular/core';
import { Http, Headers, Response, RequestMethod } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/delay';
import 'rxjs/add/observable/throw';

import { environment } from '../../environments/environment';
import { ConfigService } from './config.service';
import { HTTPStatusCodes } from '../shared/lib/http-status-codes';
import { MatSnackBar } from '@angular/material';

@Injectable()
export class ApiService {

  @Output() onError = new EventEmitter<any>();

  jsonHeaders = new Headers({
    'Accept': 'application/json'
  });

  constructor(
    private http: Http,
    private config: ConfigService,
    ) { }

  anonGet(path: string): Observable<any> {
    return this.http.get(
      path,
      {
        headers: this.jsonHeaders,
        withCredentials: true
      }
    )
    .map(this.extractData)
    .catch(this.handleError.bind(this));
  }

  get(path: string, customHeaders?): Observable<any> {
    return this.http.get(
      path,
      {
        headers: customHeaders || this.jsonHeaders,
        withCredentials: true
      }
    )
    .map(this.extractData)
    .catch(this.handleError.bind(this));
  }

  post(path: string, body, customHeaders?, put?): Observable<any> {
    return this.http.request(
      path,
      {
        method: put ? RequestMethod.Put : RequestMethod.Post,
        body: body,
        headers: customHeaders || this.jsonHeaders,
        withCredentials: true
      }
    )
    .map(this.extractData)
    .catch(this.handleError.bind(this));
  }

  put(path: string, body: any): Observable<any> {
    return this.post(path, body, true).catch(this.handleError.bind(this));
  }

  private extractData(res: Response) {
    try {
      const body = res.json();
      return body || { };
    } catch (ex) {
      return { };
    }
  }

  private handleError (error: Response | any) {
    if (!environment.production) {
      console.error('VLabs ApiService::handleError', error);
    }
    this.onError.emit(error);
    throw error;
  }
}
