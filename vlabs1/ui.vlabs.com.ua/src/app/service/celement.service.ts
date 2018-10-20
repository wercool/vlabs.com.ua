import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

import { HTTPStatusCodes } from '../shared/lib/http-status-codes'

import { 
  CElement, CElementItem
} from '../model/index';

@Injectable()
export class CElementService {

  constructor(
    private apiService: ApiService,
    private config: ConfigService
    ) { }

    update(cElement:CElement) {
      return this.apiService.post(this.config.celement_update_url, cElement);
    }
    getCElementItemById(id: number) {
      return this.apiService.get(this.config.celement_item_url + '/' + id);
    }
    getCElementItemsByCElementId(id: number) {
      return this.apiService.get(this.config.celement_items_url + '/' + id);
    }
    updateCElementItem(cElementItem: CElementItem) {
      return this.apiService.post(this.config.celement_item_update_url, cElementItem);
    }
}
