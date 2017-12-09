import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

import { HTTPStatusCodes } from '../shared/lib/http-status-codes'


@Injectable()
export class SubscriptionService {

  constructor(
    private apiService: ApiService,
    private config: ConfigService
    ) { }

  getSubscriptionCards(subId: string) {
    return this.apiService.get(this.config.subscription_cards_url + subId);
  }
}
