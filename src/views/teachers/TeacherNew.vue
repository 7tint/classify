<template>
  <form @submit.prevent="postTeacher()">
    <h5 class="mb-3">Add Teacher</h5>
    <div class="form-row">
      <div class="col">
        <div class="form-group">
          <label for="first-name">Teacher First Name</label>
          <input type="text" class="form-control" v-for="teacher.firstName" id="first-name" placeholder="Teacher First Name" required>
        </div>
      </div>
      <div class="col">
          <div class="form-group">
            <label for="last-name">Teacher Last Name</label>
            <input type="text" class="form-control" v-for="teacher.lastName" id="last-name" placeholder="Teacher Last Name" required>
          </div>
        </div>
      <div class="col">
        <div class="form-group">
          <label for="preferred-title">Preffered Title</label>
          <input type="text" class="form-control" v-for="teacher.preferredTitle" id="preferred-title" placeholder="Preffered Title" required>
        </div>
      </div>
    </div>
    <div class="form-row">
      <div class="col">
        <div class="form-group">
          <label for="profile-picture">Profile Picture</label>
          <input type="text" class="form-control" v-for="teacher.profilePicture" id="profile-picture" placeholder="Profile Picture">
        </div>
      </div>
    </div>
    <button type="submit" class="btn btn-primary">Add Teacher</button>
  </form>
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
        teacher: {}
      }
    },
    methods: {
      postTeacher() {
        let uri = `http://127.0.0.1:3000/api/teachers/`;
        this.axios.post(uri, this.teacher).then(() => {
          this.$router.push({name: "teacherIndex"});
        });
      }
    }
  }
</script>
