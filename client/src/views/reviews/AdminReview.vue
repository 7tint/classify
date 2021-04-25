<template>
  <div class="container">
    <router-link class="btn btn-primary" :to="{name: 'home'}">Home</router-link> <br/>

    <h1 class="mb-1">Reviews</h1>
    <br/><br/>
    <h4 class="mb-1">Not Approved Reviews</h4>
    <br/>

    <div class="d-flex flex-row mt-5">
      <br/>
      <div v-for="review in reviews" :key="review._id" class="p-2 m-1 bg-light">
        <p>Metric 1: {{review.metric1}}</p>
        <p>Metric 2: {{review.metric2}}</p>
        <p>Metric 3: {{review.metric3}}</p>
        <p>Comment: {{review.commentText}}</p>
        <br/>
        <button class="btn btn-danger" @click.prevent="putReview(review._id)">Approve</button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        reviews: []
      }
    },
    created() {
      let uri = `http://127.0.0.1:3000/api/admin/reviews?approved=false`;
      this.axios.get(uri).then((response) => {
          this.reviews = response.data.reviews;
      });
    },
    methods: {
      putReview(id) { // approve review
        let uri = `http://127.0.0.1:3000/api/admin/reviews/${id}`;
        const approvedReview = {
          isApproved: true
        };
        this.axios.put(uri, {review: approvedReview}).then(() => {
          this.reviews.splice(this.reviews.indexOf(id), 1);
        });
      }
    }
  }
</script>
