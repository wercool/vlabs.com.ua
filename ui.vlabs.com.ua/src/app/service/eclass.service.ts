import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

import { HTTPStatusCodes } from '../shared/lib/http-status-codes'

import { 
  EClass
} from '../model/index';

@Injectable()
export class EClassService {

  constructor(
    private apiService: ApiService,
    private config: ConfigService
    ) { }

  addNew(eclass: EClass) {
    return this.apiService.post(this.config.eclass_add_url, eclass);
  }
  getAll() {
    return this.apiService.get(this.config.eclasses_url);
  }
}
