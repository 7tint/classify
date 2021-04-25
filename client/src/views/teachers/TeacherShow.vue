<template>
  <div class="container">
    <router-link class="btn btn-primary" :to="{name: 'home'}">Home</router-link> <br/>
    <router-link class="btn btn-primary" :to="{name: 'teacherIndex'}">Teachers</router-link> <br/>
    <router-link :to="{name: 'teacherReviewNew'}">Add Review</router-link> <br/>

    <h1 class="mb-1">{{teacher.name.firstName}} {{teacher.name.lastName}}</h1>
    <!-- <div v-for="review in reviews" :key="review._id">
      <router-link class="btn btn-primary" :to="{name: 'reviewEdit', params: {code: this.course.code, _id: review._id}}">Edit Review</router-link>
    </div> -->
    <br/><br/>
    <div v-for="course in teacher.courses" :key="course">
      {{course}}
    </div>
    <router-link class="btn btn-primary" :to="{name: 'teacherIndex'}">Teachers</router-link>
    <br/>
    <router-link class="btn btn-primary" :to="{name: 'teacherEdit', params: {name: this.$route.params.name}}">Edit</router-link>
    <br/>
    <!-- <router-link class="btn btn-primary" :to="{name: 'reviewPost', params: {code: this.course.code}}">Add Review</router-link> -->
  </div>
</template>

<script>
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
    }
  }
</script>
