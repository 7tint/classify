<template>
  <div class="container">
    <router-link class="btn btn-primary" :to="{name: 'home'}">Home</router-link> <br/>

    <h1 class="mb-1">Reviews</h1>
    <br/>
    <h4 class="mb-1">Not Approved Reviews</h4>

    <div class="d-flex flex-row mt-5">
      <br/>
      <div v-for="review in pendingReviews" :key="review._id" class="p-2 m-1 bg-light">
        <p>Metric 1: {{review.metric1}}</p>
        <p>Metric 2: {{review.metric2}}</p>
        <p>Metric 3: {{review.metric3}}</p>
        <p>Comment: {{review.commentText}}</p>
        <br/>
        <button class="btn btn-danger" @click.prevent="putReview(review._id, true)">Approve</button>
      </div>
    </div>

    <h4 class="mb-1">Approved Reviews</h4>

    <div class="d-flex flex-row mt-5">
      <br/>
      <div v-for="review in approvedReviews" :key="review._id" class="p-2 m-1 bg-light">
        <p>Metric 1: {{review.metric1}}</p>
        <p>Metric 2: {{review.metric2}}</p>
        <p>Metric 3: {{review.metric3}}</p>
        <p>Comment: {{review.commentText}}</p>
        <br/>
        <button class="btn btn-danger" @click.prevent="putReview(review._id, false)">Disapprove</button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        pendingReviews: [],
        approvedReviews: []
      }
    },
    created() {
      let uri_false = `http://127.0.0.1:3000/api/admin/reviews?approved=false`;
      let uri_true = `http://127.0.0.1:3000/api/admin/reviews?approved=true`;
      this.axios.get(uri_false).then((response) => {
        this.pendingReviews = response.data.reviews;
      });
      this.axios.get(uri_true).then((response) => {
        this.approvedReviews = response.data.reviews;
      });
    },
    methods: {
      putReview(id, approveordisaprove) { // approve review
        let uri = `http://127.0.0.1:3000/api/admin/reviews/${id}`;
        let uri_false = `http://127.0.0.1:3000/api/admin/reviews?approved=false`;
        let uri_true = `http://127.0.0.1:3000/api/admin/reviews?approved=true`;
        const approvedReview = {
          isApproved: approveordisaprove
        };
        this.axios.put(uri, {review: approvedReview}).then(() => {
          this.axios.get(uri_false).then((response) => {
            this.pendingReviews = response.data.reviews;
          });
          this.axios.get(uri_true).then((response) => {
            this.approvedReviews = response.data.reviews;
          });
        });
      }
    }
  }
</script>
