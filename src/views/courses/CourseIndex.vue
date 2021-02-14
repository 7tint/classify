<template>
  <div class="m-5">
    Courses Page <br/>
    <router-link class="btn btn-primary" :to="{name: 'home'}">Home</router-link>

    <div class="d-flex flex-row mt-5">
      <router-link class="btn btn-primary" :to="{name: 'courseNew'}">New Course</router-link>
      <br/>
      <div v-for="course in courses" :key="course._id" class="p-2 m-1 bg-light">
        <p>Name: {{course.name}}</p>
        <p>Department: {{course.departmentName}}</p>
        <p>Code: {{course.code}}</p>
        <p>Description: {{course.description}}</p>
        <p>Grade: {{course.grade}}</p>
        <p>Pace: {{course.pace}}</p>
        <p>Prerequisites: {{course.prereq}}</p>
        <p>Teachers: {{course.teachers}}</p>
        <br/>
        <router-link class="btn btn-primary" :to="{name: 'courseShow', params: {code: course.code}}">View</router-link>
        <br/>
        <router-link class="btn btn-primary" :to="{name: 'courseEdit', params: {code: course.code}}">Edit</router-link>
        <br/>
        <button class="btn btn-danger" @click.prevent="deleteCourse(course.code)">Delete</button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        courses: []
      }
    },
    created() {
      let uri = `http://127.0.0.1:3000/api/courses`;
      this.axios.get(uri).then(response => {
        this.courses = response.data.courses;
      });
    },
    methods: {
      deleteCourse(id) {
        let uri = `http://127.0.0.1:3000/api/courses/${id}`;
        this.axios.delete(uri).then(() => {
          this.courses.splice(this.courses.indexOf(id), 1);
        });
      }
    }
  }
</script>
