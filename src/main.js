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
];

const router = new VueRouter({mode: 'history', routes: routes});

new Vue(Vue.util.extend({router}, App)).$mount('#app');
