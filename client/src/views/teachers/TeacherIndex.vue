<template>
  <div class="m-5">
    Teachers Page <br/>
    <router-link class="btn btn-primary" :to="{name: 'home'}">Home</router-link>

    <div class="d-flex flex-row mt-5">
      <router-link class="btn btn-primary" :to="{name: 'teacherNew'}">New Teacher</router-link>
      <br/>
      <div v-for="teacher in teachers" :key="teacher.name.firstName + '_' + teacher.name.lastName" class="p-2 m-1 bg-light">
        <p>Name: {{teacher.name}}</p>
        <router-link class="btn btn-primary" :to="{name: 'teacherShow', params: {name: teacher.name.firstName + '_' + teacher.name.lastName}}">View</router-link>
        <br/>
        <router-link class="btn btn-primary" :to="{name: 'teacherEdit', params: {name: teacher.name.firstName + '_' + teacher.name.lastName}}">Edit</router-link>
        <br/>
        <button class="btn btn-danger" @click.prevent="deleteTeacher(teacher.name.firstName + '_' + teacher.name.lastName)">Delete</button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        teachers: []
      }
    },
    created() {
      let uri = `http://127.0.0.1:3000/api/teachers`;
      this.axios.get(uri).then(response => {
        this.teachers = response.data.teachers;
      });
    },
    methods: {
      deleteTeacher(name) {
        let uri = `http://127.0.0.1:3000/api/teachers/${name}`;
        this.axios.delete(uri).then(() => {
          let uri = `http://127.0.0.1:3000/api/teachers`;
          this.axios.get(uri).then(response => {
            this.teachers = response.data.teachers;
          });
        });
      }
    }
  }
</script>
