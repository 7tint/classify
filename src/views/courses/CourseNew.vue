<template>
  <div class="m-5">
    <a href="/">Home</a> <br/>
    <router-link class="btn btn-primary" :to="{name: 'courseIndex'}">Courses</router-link>
    <a href="/admin">Admin</a>

    <form @submit.prevent="postCourse()">
      <h5 class="mb-3">Add Course</h5>
      <div class="form-row">
        <div class="col">
          <div class="form-group">
            <label for="name">Course Name</label>
            <input type="text" class="form-control" v-model="course.name" id="name" placeholder="Course Name" required>
          </div>
        </div>
        <div class="col">
          <div class="form-group">
            <label for="code">Course Code</label>
            <input type="text" class="form-control" v-model="course.code" id="code" placeholder="Course Code" required>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label for="description">Course Description</label>
        <textarea class="form-control" v-model="course.description" id="description" rows="3"></textarea>
      </div>
      <div class="form-row">
        <div class="col">
          <div class="form-group">
            <label for="grade">Course Grade</label>
            <input type="number" class="form-control" v-model="course.grade" id="grade" placeholder="Course Grade" required>
          </div>
        </div>
        <div class="col">
          <div class="form-group">
            <label for="pace">Course Pace</label>
            <input type="text" class="form-control" v-model="course.pace" id="pace" placeholder="Course Pace">
          </div>
        </div>
      </div>
      <div class="form-row">
        <!-- <div class="col">
          <div class="form-group">
            <div class="mt-2 mb-4">
              <label for="prerequisites">Course Prerequisites</label> <br/>
              <select class="mb-3" id="prerequisites" multiple="multiple" v-model="course.coursePrerequisites[]">
                <option v-for="course in courses" :key="course._id" value="{{course.code}}">{{course.code}}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="col">
          <div class="form-group">
            <label for="pace">Course Department</label>
            <select class="form-control mb-3" id="department" v-model="course.courseDepartment">
              <option value="">None</option>
              <option value=<%= department._id %>><%= department.name %></option>
            </select>
          </div>
        </div> -->
      </div>
      <button class="btn btn-primary">Add Course</button>
    </form>
  </div>
</template>

<script>
  // $(document).ready(function() {
  //   $('#prerequisites').multiselect({
  //     enableFiltering: true,
  //     filterBehavior: 'value',
  //     enableCaseInsensitiveFiltering: true
  //   });
  // });

  export default {
    data() {
      return {
        course: {}
      }
    },
    methods: {
      postCourse() {
        let uri = `http://127.0.0.1:3000/api/courses/`;
        this.axios.post(uri, {course: this.course}).then(() => {
          this.$router.push({name: "courseIndex"});
        });
      }
    }
  }
</script>
