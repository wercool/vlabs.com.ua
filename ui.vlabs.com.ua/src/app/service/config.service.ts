import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class ConfigService {

  constructor() { }

  private _api_url = '/api'

  private _refresh_token_url                        = this._api_url + '/refresh';
  private _login_url                                = this._api_url + '/login';
  private _logout_url                               = this._api_url + '/logout';
  private _change_password_url                      = this._api_url + '/change-password';
  private _whoami_url                               = this._api_url + '/whoami';
  private _authorize_user_url                       = this._api_url + '/authorize/';

  private _register_url                             = this._api_url + '/register';
  private _register_collaborator_url                = this._register_url + '/collaborator/{collaboratorId}';

  private _user_url                                 = this._api_url + '/user';
  private _user_update_url                          = this._user_url + '/update';
  private _users_url                                = this._user_url + '/all';
  private _users_paged_url                          = this._user_url + '/all-paged/{page}/{size}';
  private _user_profile_url                         = this._user_url + '/update-profile';
  private _user_update_profile_photo_url            = this._user_url + '/update-profile-photo';
  private _user_get_profile_photo_url               = this._user_url + '/get-profile-photo';
  private _user_reset_password                      = this._user_url + '/reset-password/';
  private _user_update_authorities                  = this._user_url + '/update-authorities/';
  private _users_wo_authorities_url                 = this._user_url + '/all-wo-authorites';

  private _course_url                               = this._api_url + '/course';
  private _course_add_url                           = this._course_url + '/add';
  private _courses_url                              = this._course_url + '/all';
  private _course_update_url                        = this._course_url + '/update';
  private _course_eclasses_url                      = this._course_url + '/{courseId}/course-eclasses';
  private _course_non_course_eclasses_url           = this._course_url + '/{courseId}/non-course-eclasses';
  private _course_add_eclasses_url                  = this._course_url + '/{courseId}/addeclasses';
  private _course_remove_eclasses_url               = this._course_url + '/{courseId}/removeeclasses';

  private _module_url                               = this._api_url + '/module';
  private _module_add_url                           = this._module_url + '/add';
  private _modules_url                              = this._module_url + '/all';

  private _department_url                           = this._api_url + '/department';
  private _department_add_url                       = this._department_url + '/add';
  private _departments_url                          = this._department_url + '/all';

  private _faculty_url                              = this._api_url + '/faculty';
  private _faculty_add_url                          = this._faculty_url + '/add';
  private _faculties_url                            = this._faculty_url + '/all';
  private _faculty_update_url                       = this._faculty_url + '/update';
  private _faculty_groups_url                       = this._faculty_url + '/{facultyId}/faculty-groups';
  private _faculty_non_faculty_groups_url           = this._faculty_url + '/{facultyId}/non-faculty-groups';
  private _faculty_add_groups_url                   = this._faculty_url + '/{facultyId}/addgroups';
  private _faculty_remove_groups_url                = this._faculty_url + '/{facultyId}/removegroups';

  private _group_url                                = this._api_url + '/group';
  private _group_add_url                            = this._group_url + '/add';
  private _groups_url                               = this._group_url + '/all';
  private _group_update_url                         = this._group_url + '/update';
  private _group_members_url                        = this._group_url + '/{groupId}/members';
  private _group_non_members_url                    = this._group_url + '/{groupId}/non-members';
  private _group_add_members_url                    = this._group_url + '/{groupId}/addmembers';
  private _group_remove_members_url                 = this._group_url + '/{groupId}/removemembers';

  //EClasses
  private _eclass_url                               = this._api_url + '/eclass';
  private _eclass_add_url                           = this._eclass_url + '/add';
  private _eclass_update_url                        = this._eclass_url + '/update';
  private _eclasses_url                             = this._eclass_url + '/all';
  private _eclass_summary_url                       = this._eclass_url + '/summary/';
  private _eclass_update_summary_url                = this._eclass_url + '/update-summary/';
  private _eclass_formats_url                       = this._eclass_url + '/formats';
  private _eclass_structure_url                     = this._eclass_url + '/structure/';
  private _eclass_update_structure_url              = this._eclass_url + '/structure/update';

  //CElements
  private _celement_url                             = this._api_url + '/celement';
  private _celement_update_url                      = this._celement_url + '/update';
  private _celement_item_url                        = this._celement_url + '/item';
  private _celement_items_url                       = this._celement_url + '/items';
  private _celement_item_update_url                 = this._celement_item_url + '/update';

  private _vlab_url                                 = this._api_url + '/vlab';
  private _vlab_add_url                             = this._vlab_url + '/add';
  private _vlabs_url                                = this._vlab_url + '/all';
  private _vlabs_update_url                         = this._vlab_url + '/update';

  private _partner_url                              = this._api_url + '/partner';
  private _partner_add_url                          = this._partner_url + '/add';
  private _partners_url                             = this._partner_url + '/all';

  //Collaborators
  private _collaborator_url                         = this._api_url + '/collaborator';
  private _collaborator_by_user_id_url              = this._collaborator_url + '/user/{userId}';
  private _collaborator_update_url                  = this._collaborator_url + '/update'
  private _collaborator_add_url                     = this._collaborator_url + '/add';
  private _collaborators_url                        = this._collaborator_url + '/all';

  //Collaborators Projects
  private _collaborators_project_url                    = this._collaborator_url + '/project';
  private _collaborators_projects_url                   = this._collaborators_project_url + '/all';
  private _collaborators_project_add_url                = this._collaborators_project_url + '/add';
  private _collaborator_non_collaborator_projects_url   = this._collaborators_project_url + '/{collaboratorId}/non-collaborator-projects';
  private _collaborator_add_projects_url                = this._collaborators_project_url + '/{collaboratorId}/addprojects';
  private _collaborator_remove_projects_url             = this._collaborators_project_url + '/{collaboratorId}/removeprojects';
  private _collaborator_project_url                     = this._collaborators_project_url + '/{collaboratorProjectId}';
  private _collaborator_project_work_item_url           = this._collaborators_project_url + '/workitem/{collaboratorProjectWorkItemId}'
  private _collaborator_project_work_items_url          = this._collaborators_project_url + '/workitems/{collaboratorId}/{collaboratorProjectId}';
  private _collaborator_project_work_item_add_url       = this._collaborators_project_url + '/workitem/add';

  //Subscription
  private _subscription_url                         = this._api_url + '/subscription';
  private _subscription_cards_url                   = this._subscription_url + '/cards/';

  private _foo_url                                  = this._api_url + '/foo';

  get refresh_token_url(): string {
      return this._refresh_token_url;
  }

  get whoami_url(): string {
      return this._whoami_url;
  }

  get login_url(): string { return this._login_url; }
  get logout_url(): string { return this._logout_url; }

  get register_url(): string { return this._register_url; }
  get register_collaborator_url(): string { return this._register_collaborator_url; }

  //Users
  get user_url(): string { return this._user_url; }
  get users_paged_url(): string { return this._users_paged_url; }
  get users_url(): string { return this._users_url; }
  get user_update_url(): string { return this._user_update_url; }
  get user_profile_url(): string { return this._user_profile_url; }
  get user_update_profile_photo_url(): string { return this._user_update_profile_photo_url; }
  get user_get_profile_photo_url(): string { return this._user_get_profile_photo_url; }
  get user_reset_password(): string { return this._user_reset_password; }
  get user_update_authorities(): string { return this._user_update_authorities; }
  get users_wo_authorities_url(): string { return this._users_wo_authorities_url; }
  get authorize_user_url(): string { return this._authorize_user_url; }
  get change_password_url(): string { return this._change_password_url; }

  //Vlabs
  get vlab_url(): string { return this._vlab_url; };
  get vlab_add_url(): string { return this._vlab_add_url; }
  get vlabs_url(): string { return this._vlabs_url; }
  get vlabs_update_url(): string { return this._vlabs_update_url; };

  //Courses
  get course_url(): string { return this._course_url; };
  get course_add_url(): string { return this._course_add_url; };
  get courses_url(): string { return this._courses_url; };
  get course_update_url(): string { return this._course_update_url; };
  get course_eclasses_url(): string { return this._course_eclasses_url; };
  get course_non_course_eclasses_url(): string { return this._course_non_course_eclasses_url; };
  get course_add_eclasses_url(): string { return this._course_add_eclasses_url; };
  get course_remove_eclasses_url(): string { return this._course_remove_eclasses_url; };

  //Modules
  get module_add_url(): string { return this._module_add_url; };
  get modules_url(): string { return this._modules_url; };

  //Departments
  get department_add_url(): string { return this._department_add_url; };
  get departments_url(): string { return this._departments_url; };

  //Faculties
  get faculty_url(): string { return this._faculty_url; };
  get faculty_add_url(): string { return this._faculty_add_url; };
  get faculties_url(): string { return this._faculties_url; };
  get faculty_update_url(): string { return this._faculty_update_url; };
  get faculty_groups_url(): string { return this._faculty_groups_url; };
  get faculty_non_faculty_groups_url(): string { return this._faculty_non_faculty_groups_url; };
  get faculty_add_groups_url(): string { return this._faculty_add_groups_url; };
  get faculty_remove_groups_url(): string { return this._faculty_remove_groups_url; };

  //Groups
  get group_url(): string { return this._group_url; };
  get group_add_url(): string { return this._group_add_url; };
  get groups_url(): string { return this._groups_url; };
  get group_update_url(): string { return this._group_update_url; };
  get group_non_members_url(): string { return this._group_non_members_url; }
  get group_members_url(): string { return this._group_members_url; }
  get group_add_members_url(): string { return this._group_add_members_url; }
  get group_remove_members_url(): string { return this._group_remove_members_url; }

  //EClasses
  get eclass_url(): string { return this._eclass_url; };
  get eclass_add_url(): string { return this._eclass_add_url; };
  get eclass_update_url(): string { return this._eclass_update_url; };
  get eclasses_url(): string { return this._eclasses_url; };
  get eclass_summary_url(): string { return this._eclass_summary_url; };
  get eclass_update_summary_url(): string { return this._eclass_update_summary_url; };
  get eclass_formats_url(): string { return this._eclass_formats_url; };
  get eclass_structure_url(): string { return this._eclass_structure_url; };
  get eclass_update_structure_url(): string { return this._eclass_update_structure_url; };

  //CElements
  get celement_url(): string { return this._celement_url; };
  get celement_update_url(): string { return this._celement_update_url; };
  get celement_item_url(): string { return this._celement_item_url; };
  get celement_items_url(): string { return this._celement_items_url; };
  get celement_item_update_url(): string { return this._celement_item_update_url; };

  //Partners
  get partner_add_url(): string { return this._partner_add_url; };
  get partners_url(): string { return this._partners_url; };

  //Collaborators
  get collaborator_url(): string { return this._collaborator_url; };
  get collaborator_by_user_id_url(): string { return this._collaborator_by_user_id_url; };
  get collaborator_update_url(): string { return this._collaborator_update_url; };
  get collaborator_add_url(): string { return this._collaborator_add_url; };
  get collaborators_url(): string { return this._collaborators_url; };
  get collaborators_projects_url(): string { return this._collaborators_projects_url; };
  get collaborators_project_add_url(): string { return this._collaborators_project_add_url; };
  get collaborator_non_collaborator_projects_url(): string { return this._collaborator_non_collaborator_projects_url; };
  get collaborator_add_projects_url(): string { return this._collaborator_add_projects_url; };
  get collaborator_remove_projects_url(): string { return this._collaborator_remove_projects_url; };
  get collaborator_project_url(): string { return this._collaborator_project_url; };
  get collaborator_project_work_item_url(): string { return this._collaborator_project_work_item_url; };
  get collaborator_project_work_items_url(): string { return this._collaborator_project_work_items_url; };
  get collaborator_project_work_item_add_url(): string { return this._collaborator_project_work_item_add_url; };

  //Subscription
  get subscription_cards_url(): string { return this._subscription_cards_url; };

  get foo_url(): string {
      return this._foo_url;
  }
}
