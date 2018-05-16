import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { ApiService } from './api.service';

import { HTTPStatusCodes } from '../shared/lib/http-status-codes'

import { 
   HelpClip
} from '../model/index';

@Injectable()
export class HelpClipService {

  constructor(
    private apiService: ApiService
    ) { }
  getById(id: number) {
    return this.apiService.get(this.apiService.helpclipURL+ '/' + id);
  }
  getAll() {
    return this.apiService.get(this.apiService.helpclipsURL);
  }
}
