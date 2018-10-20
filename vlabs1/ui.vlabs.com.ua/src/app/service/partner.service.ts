import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

import { HTTPStatusCodes } from '../shared/lib/http-status-codes'

import { 
  Partner
} from '../model/index';

@Injectable()
export class PartnerService {

  constructor(
    private apiService: ApiService,
    private config: ConfigService
    ) { }

  addNew(partner: Partner) {
    return this.apiService.post(this.config.partner_add_url, partner);
  }
  getAll() {
    return this.apiService.get(this.config.partners_url);
  }
}
