import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestMethod } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/delay';
import 'rxjs/add/observable/throw';

import { environment } from '../../environments/environment';
import { ConfigService } from './config.service';
import { HTTPStatusCodes } from '../shared/lib/http-status-codes';

@Injectable()
export class ApiService {

  apiError: Observable<any>;

  headers = new Headers({
    'Accept': 'application/json'
  });

  constructor(
    private http: Http,
    private config: ConfigService
    ) { }

  anonGet(path: string): Observable<any> {
    return this.http.get(
      path,
      {
        headers: this.headers,
        withCredentials: true
      }
    )
    .map(this.extractData);
  }

  get(path: string): Observable<any> {
    return this.http.get(
      path,
      {
        headers: this.headers,
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
        headers: customHeaders || this.headers,
        withCredentials: true
      }
    )
    .map(this.extractData)
    .catch(this.handleError.bind(this));
  }

  put(path: string, body: any): Observable<any> {
    return this.post(path, body, true);
  }

  private extractData(res: Response) {
    const body = res.json();
    return body || { };
  }

  private handleError (error: Response | any) {
    if (!environment.production) {
      console.error('ApiService::handleError', error);
    }
    // if (error.status == HTTPStatusCodes.GATEWAY_TIMEOUT || 
    //     error.status == HTTPStatusCodes.NOT_FOUND
    //    )
    // {
    //   if (!window.location.href.endsWith('/login'))
    //   {
    //     window.location.href = '/login';
    //   }
    // }
    this.apiError = Observable.throw(error);
    throw error;
  }
}
