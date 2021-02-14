<template>
  <div class="container">
    <h1 class="mb-1">{{course.code}}</h1>
    <!-- <div v-for="review in reviews" :key="review._id">
      <router-link class="btn btn-primary" :to="{name: 'reviewEdit', params: {code: this.course.code, _id: review._id}}">Edit Review</router-link>
    </div> -->
    <br/><br/>
    <router-link class="btn btn-primary" :to="{name: 'courseIndex'}">Courses</router-link>
    <br/>
    <router-link class="btn btn-primary" :to="{name: 'courseEdit', params: {code: this.$route.params.code}}">Edit</router-link>
    <br/>
    <!-- <router-link class="btn btn-primary" :to="{name: 'reviewPost', params: {code: this.course.code}}">Add Review</router-link> -->
  </div>
</template>

<script>
  export default {
    data() {
      return {
        course: {}
      }
    },
    created() {
      let uri = `http://127.0.0.1:3000/api/courses/${this.$route.params.code}`;
      this.axios.get(uri).then((response) => {
          this.course = response.data.course;
      });
    }
  }
</script>
