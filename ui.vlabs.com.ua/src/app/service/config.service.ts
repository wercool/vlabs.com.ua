import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class ConfigService {

  constructor() { }

  private _api_url = '/api'

  private _refresh_token_url            = this._api_url + '/refresh';
  private _register_url                 = this._api_url + '/register';
  private _login_url                    = this._api_url + '/login';
  private _logout_url                   = this._api_url + '/logout';
  private _change_password_url          = this._api_url + '/change-password';
  private _whoami_url                   = this._api_url + '/whoami';

  private _user_url                     = this._api_url + '/user';
  private _users_url                    = this._user_url + '/all';
  private _user_profile_url             = this._user_url + '/update-profile';
  private _user_profile_photo_url       = this._user_url + '/update-profile-photo/';
  private _user_reset_password          = this._user_url + '/reset-password/';
  private _user_update_authorities      = this._user_url + '/update-authorities/';
  private _users_wo_authorities_url     = this._user_url + '/all-wo-authorites';
  private _authorize_user_url           = this._api_url + '/authorize/';

  private _foo_url                      = this._api_url + '/foo';

  get refresh_token_url(): string {
      return this._refresh_token_url;
  }

  get whoami_url(): string {
      return this._whoami_url;
  }

  get user_url(): string {
      return this._user_url;
  }

  get users_url(): string {
      return this._users_url;
  }

  get user_profile_url(): string {
      return this._user_profile_url;
  }

  get user_profile_photo_url(): string {
      return this._user_profile_photo_url;
  }

  get user_reset_password(): string {
      return this._user_reset_password;
  }

  get user_update_authorities(): string {
      return this._user_update_authorities;
  }

  get users_wo_authorities_url(): string {
    return this._users_wo_authorities_url;
  }

  get login_url(): string {
      return this._login_url;
  }

  get register_url(): string {
      return this._register_url;
  }

  get logout_url(): string {
      return this._logout_url;
  }

  get authorize_user_url(): string {
    return this._authorize_user_url;
  }

  get change_password_url(): string {
      return this._change_password_url;
  }

  get foo_url(): string {
      return this._foo_url;
  }
}
