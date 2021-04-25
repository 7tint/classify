<template>
  <div class="container">
    <router-link class="btn btn-primary" :to="{name: 'home'}">Home</router-link> <br/>
    <router-link class="btn btn-primary" :to="{name: 'courseIndex'}">Courses</router-link> <br/>
    <router-link :to="{name: 'courseReviewNew'}">Add Review</router-link> <br/>

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

    <div class="d-flex flex-row mt-5">
      <br/>
      <div v-for="review in course.reviews" :key="review._id" class="p-2 m-1 bg-light">
        <p>Metric 1: {{review.metric1}}</p>
        <p>Metric 2: {{review.metric2}}</p>
        <p>Metric 3: {{review.metric3}}</p>
        <p>Comment: {{review.commentText}}</p>
        <br/>
        <router-link class="btn btn-primary" :to="{name: 'courseReviewEdit', params: {code: course.code, id: review._id}}">Edit</router-link>
        <br/>
        <!-- <button class="btn btn-danger" @click.prevent="deleteCourse(course.code)">Delete</button> -->
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        course: {},
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
