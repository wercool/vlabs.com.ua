import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

import { HTTPStatusCodes } from '../shared/lib/http-status-codes'

import { 
  Module
} from '../model/index';

@Injectable()
export class ModuleService {

  constructor(
    private apiService: ApiService,
    private config: ConfigService
    ) { }

  addNew(module: Module) {
    return this.apiService.post(this.config.module_add_url, module);
  }
  getAll() {
    return this.apiService.get(this.config.modules_url);
  }
}
