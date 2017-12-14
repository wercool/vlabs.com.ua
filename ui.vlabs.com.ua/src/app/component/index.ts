export * from './header/header.component';
export * from './not-found/not-found.component';
export * from './home/home.component';
export * from './home/admin-home/admin-home.component';
export * from './home/user-home/user-home.component';
export * from './login/login.component';
export * from './register/register.component';

/* authenticated user components */
export * from './edit-profile/edit-profile.component';
export * from './reset-password/reset-password.component'

/* ROLE_USER components */
export * from './side-nav/user-sidenav/user-sidenav.component';

/* ROLE_MANAGER components */
export * from './side-nav/manager-sidenav/manager-sidenav.component';
export * from './manager/department/department-management.component';
export * from './manager/department/new-department/new-department.component';
export * from './manager/faculty/faculty-management.component';
export * from './manager/faculty/new-faculty/new-faculty.component';
export * from './manager/group/group-management.component';
export * from './manager/group/new-group/new-group.component';
export * from './manager/vlabs/vlabs-management.component';
export * from './manager/vlabs/new-vlab/new-vlab.component';

/* ROLE_ADMIN components */
export * from './side-nav/admin-sidenav/admin-sidenav.component';
export * from './admin/user-management/user-management.component';
export * from './admin/user-management/auth-user-dialog/auth-user-dialog.component';
export * from './admin/user-management/edit-user-dialog/edit-user-dialog.component';
export * from './admin/partner-management/partner-management.component';
export * from './admin/partner-management/new-partner/new-partner.component';


/* ROLE_ADMIN || ROLE_MANAGER components */
export * from './course/course-management.component';
export * from './course/new-course/new-course.component';
export * from './eclass/eclass-management.component';
export * from './eclass/new-eclass/new-eclass.component';
export * from './eclass/edit-eclass/edit-eclass.component';
export * from './celement/add-celement-dialog/add-celement-dialog.component';
export * from './module/module-management.component';
export * from './module/new-module/new-module.component';