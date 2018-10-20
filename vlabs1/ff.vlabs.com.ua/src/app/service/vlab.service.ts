import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { ApiService } from './api.service';

import { HTTPStatusCodes } from '../shared/lib/http-status-codes'

import { 
  Vlab
} from '../model/index';

@Injectable()
export class VlabService {

  constructor(
    private apiService: ApiService
    ) { }

}