<template>
  <div class="m-5">
    <router-link class="btn btn-primary" :to="{name: 'home'}">Home</router-link>
    <br>
    <router-link class="btn btn-primary" :to="{name: 'courseIndex'}">Courses</router-link>

    <form @submit.prevent="postReview()">
      <h5 class="mb-3">Edit Course Review</h5>
      <div class="form-row">
        <div class="col">
          <div class="form-group">
            <label for="metric1">Metric 1</label>
            <div class="radio">
              <label><input type="radio" name="metric1" value="1" v-model="review.metric1" required>1</label>
              <label><input type="radio" name="metric1" value="2" v-model="review.metric1">2</label>
              <label><input type="radio" name="metric1" value="3" v-model="review.metric1">3</label>
              <label><input type="radio" name="metric1" value="4" v-model="review.metric1">4</label>
              <label><input type="radio" name="metric1" value="5" v-model="review.metric1">5</label>
            </div>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="form-group">
          <label for="metric2">Metric 2</label>
          <div class="radio">
            <label><input type="radio" name="metric2" value="1" v-model="review.metric2" required>1</label>
            <label><input type="radio" name="metric2" value="2" v-model="review.metric2">2</label>
            <label><input type="radio" name="metric2" value="3" v-model="review.metric2">3</label>
            <label><input type="radio" name="metric2" value="4" v-model="review.metric2">4</label>
            <label><input type="radio" name="metric2" value="5" v-model="review.metric2">5</label>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="form-group">
          <label for="metric3">Metric 3</label>
          <div class="radio">
            <label><input type="radio" name="metric3" value="1" v-model="review.metric3" required>1</label>
            <label><input type="radio" name="metric3" value="2" v-model="review.metric3">2</label>
            <label><input type="radio" name="metric3" value="3" v-model="review.metric3">3</label>
            <label><input type="radio" name="metric3" value="4" v-model="review.metric3">4</label>
            <label><input type="radio" name="metric3" value="5" v-model="review.metric3">5</label>
          </div>
        </div>
      </div>
      <div class="form-row">
        <div class="col">
          <div class="form-group">
            <label for="grade">Comment Text</label>
            <textarea type="text" class="form-control" v-model="review.commentText" name="commentText" id="commentText" placeholder="Comment Text" required></textarea>
          </div>
        </div>
        <div class="form-group">
          <label for="isAnonymous">Remain Anonymous</label>
          <div class="radio">
            <label><input type="radio" name="isAnonymous" value="true" v-model="review.isAnonymous" required>True</label>
            <label><input type="radio" name="isAnonymous" value="false" v-model="review.isAnonymous">False</label>
          </div>
        </div>
      </div>
      <button type="submit" class="btn btn-primary">Add Review</button>
    </form>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        review: {}
      }
    },
    created() {
      let uri = `http://127.0.0.1:3000/api/courses/${this.$route.params.code}/reviews/${this.$route.params.id}`;
      this.axios.get(uri).then((response) => {
        this.review = response.data.review;
      });
    },
    methods: {
      editReview() {
        let uri = `http://127.0.0.1:3000/api/courses/${this.$route.params.code}/reviews/${this.$route.params.id}`;
        const updatedReview = {
          metric1: this.course.metric1,
          metric2: this.course.metric2,
          metric3: this.course.metric3,
          commentText: this.course.commentText,
          isAnonymous: this.course.isAnonymous
        };
        this.axios.put(uri, {review: updatedReview}).then(() => {
          this.$router.push({name: "courseShow", params: {code: this.$route.params.code}});
        });
      }
    }
  }
</script>
