import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

import { HTTPStatusCodes } from '../shared/lib/http-status-codes'

import { 
  EClass, EClassFormat
} from '../model/index';

@Injectable()
export class EClassService {

  constructor(
    private apiService: ApiService,
    private config: ConfigService
    ) { }

  getById(id: number) {
    return this.apiService.get(this.config.eclass_url + '/' + id);
  }
  getSummaryById(id: number) {
    return this.apiService.get(this.config.eclass_summary_url + id);
  }
  getFormats() {
    return this.apiService.get(this.config.eclass_formats_url);
  }
  addNew(eclass: EClass) {
    return this.apiService.post(this.config.eclass_add_url, eclass);
  }
  update(eclass: EClass) {
    return this.apiService.post(this.config.eclass_update_url, eclass);
  }
  updateSummary(id: number, summary: string) {
    return this.apiService.post(this.config.eclass_update_summary_url + id, summary);
  }
  eclass_update_summary_url
  getAll() {
    return this.apiService.get(this.config.eclasses_url);
  }
  getStrcuture(eClass: EClass) {
    return this.apiService.get(this.config.eclass_structure_url + '/' + eClass.id + "/"  + eClass.formatId);
  }
}
