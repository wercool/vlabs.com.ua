import { Injectable, Output, EventEmitter } from "@angular/core";
import { Http, Headers, Response, RequestMethod } from '@angular/http';
import { environment } from "src/environments/environment";
import { Observable } from "rxjs";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/delay';
import 'rxjs/add/observable/throw';

@Injectable()
export class ApiService {

    @Output() onError = new EventEmitter<any>();

    public jsonHeaders = new Headers({
        'Content-Type': 'application/json'
    });

    public APIEndpoints = {
        base: 'http://localhost:8080/api',
        auth: {
            base: '/auth',
            attempt: '/attempt'
        },
        getFullyQualifiedURL: function (endpointGroup: string, endpointPoint: string) {
            return this.base + ((this[endpointGroup].base) ? this[endpointGroup].base : '') + this[endpointGroup][endpointPoint];
        }
    };

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
}