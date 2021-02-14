<template>
  <form @submit.prevent="editTeacher()">
    <router-link class="btn btn-primary" :to="{name: 'home'}">Home</router-link>
    <router-link class="btn btn-primary" :to="{name: 'teacherIndex'}">Teachers</router-link>
    <h5 class="mb-3">Add Teacher</h5>
    <div class="form-row">
      <div class="col">
        <div class="form-group">
          <label for="first-name">Teacher First Name</label>
          <input type="text" class="form-control" v-model="teacher.name.firstName" id="first-name" placeholder="Teacher First Name" required>
        </div>
      </div>
      <div class="col">
          <div class="form-group">
            <label for="last-name">Teacher Last Name</label>
            <input type="text" class="form-control" v-model="teacher.name.lastName" id="last-name" placeholder="Teacher Last Name" required>
          </div>
        </div>
      <div class="col">
        <div class="form-group">
          <label for="preferred-title">Preffered Title</label>
          <input type="text" class="form-control" v-model="teacher.preferredTitle" id="preferred-title" placeholder="Preffered Title" required>
        </div>
      </div>
    </div>
    <div class="form-row">
      <div class="col">
        <div class="form-group">
          <label for="profile-picture">Profile Picture</label>
          <input type="text" class="form-control" v-model="teacher.profilePicture" id="profile-picture" placeholder="Profile Picture">
        </div>
      </div>
    </div>
    <button type="submit" class="btn btn-primary">Edit Teacher</button>
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
        teacher: {
          name: {
            firstName: "",
            lastName: ""
          }
        }
      }
    },
    created() {
      let uri = `http://127.0.0.1:3000/api/teachers/${this.$route.params.name}`;
      this.axios.get(uri).then((response) => {
        this.teacher = response.data.teacher;
      });
    },
    methods: {
      editTeacher() {
        let uri = `http://127.0.0.1:3000/api/teachers/${this.$route.params.name}`;
        this.axios.put(uri, {teacher: this.teacher}).then(() => {
          this.$router.push({name: "teacherShow", params: {name: this.teacher.name.firstName + '_' + this.teacher.name.lastName}});
        });
      }
    }
  }
</script>
