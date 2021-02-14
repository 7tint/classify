import Vue from "vue"
import App from "./App.vue"

import VueRouter from "vue-router";
Vue.use(VueRouter);

import VueAxios from "vue-axios";
import axios from "axios";

Vue.use(VueAxios, axios);

Vue.config.productionTip = false;

import CourseIndex from "./views/courses/CourseIndex.vue";
import CourseNew from "./views/courses/CourseNew.vue";
import CourseShow from "./views/courses/CourseShow.vue";
import CourseEdit from "./views/courses/CourseEdit.vue";
// import CourseManage from "./views/courses/CourseManage.vue";

import DepartmentIndex from "./views/departments/DepartmentIndex.vue";
import DepartmentNew from "./views/departments/DepartmentNew.vue";
import DepartmentShow from "./views/departments/DepartmentShow.vue";
import DepartmentEdit from "./views/departments/DepartmentEdit.vue";

import TeacherIndex from "./views/teachers/TeacherIndex.vue";
import TeacherNew from "./views/teachers/TeacherNew.vue";
import TeacherShow from "./views/teachers/TeacherShow.vue";
import TeacherEdit from "./views/teachers/TeacherEdit.vue";

import PreferenceIndex from "./views/preferences/PreferenceIndex.vue";
import PreferenceEdit from "./views/preferences/PreferenceEdit.vue";

// import "../";

const routes = [
  {
    name: "courseIndex",
    path: "/courses/",
    component: CourseIndex
  },
  {
    name: "courseNew",
    path: "/courses/new",
    component: CourseNew
  },
  {
    name: "courseShow",
    path: "/courses/:code",
    component: CourseShow
  },
  {
    name: "courseEdit",
    path: "/courses/:code/edit",
    component: CourseEdit
  },
  // {
  //   name: "courseManage",
  //   path: "/courses/manage",
  //   component: CourseManage
  // }
  {
    name: "departmentIndex",
    path: "/departments/",
    component: DepartmentIndex
  },
  {
    name: "departmentNew",
    path: "/departments/new",
    component: DepartmentNew
  },
  {
    name: "departmentShow",
    path: "/departments/:name",
    component: DepartmentShow
  },
  {
    name: "departmentEdit",
    path: "/departments/:name/edit",
    component: DepartmentEdit
  },
  {
    name: "teacherIndex",
    path: "/teachers/",
    component: TeacherIndex
  },
  {
    name: "teacherNew",
    path: "/teachers/new",
    component: TeacherNew
  },
  {
    name: "teacherShow",
    path: "/teachers/:name",
    component: TeacherShow
  },
  {
    name: "teacherEdit",
    path: "/teachers/:name/edit",
    component: TeacherEdit
  },
  {
    name: "preferenceIndex",
    path: "/preferences/",
    component: PreferenceIndex
  },
  {
    name: "preferenceEdit",
    path: "/preferences/edit",
    component: PreferenceEdit
  },
];

const router = new VueRouter({mode: 'history', routes: routes});

new Vue(Vue.util.extend({router}, App)).$mount('#app');
