import { Injectable, Output, EventEmitter } from '@angular/core';
import { Http, Headers, Response, RequestMethod } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/delay';
import 'rxjs/add/observable/throw';

import { environment } from '../../environments/environment';

@Injectable()
export class ApiService {

  @Output() onError = new EventEmitter<any>();

  private jsonHeaders = new Headers({
    'Accept': 'application/json'
  });

  constructor(
    private http: Http
  ) { }

  private handleError (error: Response | any) {
    if (!environment.production) {
      console.error(environment.APIName + ' ApiService::handleError', error);
    }
    this.onError.emit(error);
    throw error;
  }

  private extractData(res: Response) {
    try {
      const body = res.json();
      return body || { };
    } catch (ex) {
      return { };
    }
  }

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

  get(path: string, customHeaders?, withoutCredentials?): Observable<any> {
    return this.http.get(
      path,
      {
        headers: customHeaders || this.jsonHeaders,
        withCredentials: withoutCredentials ? false : true
      }
    )
    .map(this.extractData)
    .catch(this.handleError.bind(this));
  }

  post(path: string, body, customHeaders?, put?, withoutCredentials?): Observable<any> {
    return this.http.request(
      path,
      {
        method: put ? RequestMethod.Put : RequestMethod.Post,
        body: body,
        headers: customHeaders || this.jsonHeaders,
        withCredentials: withoutCredentials ? false : true
      }
    )
    .map(this.extractData)
    .catch(this.handleError.bind(this));
  }

  put(path: string, body: any): Observable<any> {
    return this.post(path, body, true).catch(this.handleError.bind(this));
  }

  /* VLabs REST API endpoints */

  private _api_url =                            '/api';
    private _foo_url =                            '/foo';
      private _userexists_url =                   '/userexists/{username}';
      private _login_url =                        '/login';
      private _logout_url =                       '/logout';
      private _refresh_token_url =                '/refresh';
      private _whoami_url =                       '/whoami'
      private _helpclip_url =                     '/helpclip';
      private _helpclips_url =                    '/helpclip/all';
      private _helpclip_by_alias_url =            '/helpclip/info/{alias_Base64Encoded}';

  get apiURL(): string {
    return this._api_url;
  }

  get fooURL(): string {
    return this.apiURL + this._foo_url;
  }

  get userExistsURL(): string {
    return this.apiURL + this._userexists_url;
  }

  get loginURL(): string {
    return this.apiURL + this._login_url;
  }

  get logoutURL(): string {
    return this.apiURL + this._logout_url;
  }

  get refreshTokenURL(): string {
    return this.apiURL + this._refresh_token_url;
  }

  get whoamiURL(): string {
    return this.apiURL + this._whoami_url;
  }

  /* HelpClip */
  get helpclipURL(): string {
    return this.apiURL + this._helpclip_url;
  }
  get helpclipsURL(): string {
    return this.apiURL + this._helpclips_url;
  }
}
