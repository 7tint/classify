<template>
  <div class="m-5">
    Departments Page <br/>
    <a href="/">Home</a> <br/>
    <a href="/admin">Admin</a>

    <div class="d-flex flex-row mt-5">
      <router-link class="btn btn-primary" :to="{name: 'departmentNew'}">New Department</router-link>
      <br/>
      <div v-for="department in departments" :key="department.name" class="p-2 m-1 bg-light">
        <p>Name: {{department.name}}</p>
        <router-link class="btn btn-primary" :to="{name: 'departmentShow', params: {name: department.name}}">View</router-link>
        <br/>
        <router-link class="btn btn-primary" :to="{name: 'departmentEdit', params: {name: department.name}}">Edit</router-link>
        <br/>
        <button class="btn btn-danger" @click.prevent="deleteDepartment(department.name)">Delete</button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        departments: []
      }
    },
    created() {
      let uri = `http://127.0.0.1:3000/api/departments`;
      this.axios.get(uri).then(response => {
        this.departments = response.data.departments;
      });
    },
    methods: {
      deleteDepartment(name) {
        let uri = `http://127.0.0.1:3000/api/departments/${name}`;
        this.axios.delete(uri).then(() => {
          this.departments.splice(this.departments.indexOf(name), 1);
        });
      }
    }
  }
</script>
