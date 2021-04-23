<template>
  <div class="container">
    <router-link class="btn btn-primary" :to="{name: 'home'}">Home</router-link>
    <router-link class="btn btn-primary" :to="{name: 'departmentIndex'}">Departments</router-link>
    
    <h1 class="mb-1">{{department.name}}</h1>
    <p>{{department.description}}</p>
    <!-- <div v-for="review in reviews" :key="review._id">
      <router-link class="btn btn-primary" :to="{name: 'reviewEdit', params: {code: this.course.code, _id: review._id}}">Edit Review</router-link>
    </div> -->
    <br/><br/>
    <router-link class="btn btn-primary" :to="{name: 'departmentIndex'}">Departments</router-link>
    <br/>
    <router-link class="btn btn-primary" :to="{name: 'departmentEdit', params: {name: this.$route.params.name}}">Edit</router-link>
    <br/>
    <!-- <router-link class="btn btn-primary" :to="{name: 'reviewPost', params: {code: this.course.code}}">Add Review</router-link> -->
  </div>
</template>

<script>
  export default {
    data() {
      return {
        department: {}
      }
    },
    created() {
      let uri = `http://127.0.0.1:3000/api/departments/${this.$route.params.name}`;
      this.axios.get(uri).then((response) => {
          this.department = response.data.department;
      });
    }
  }
</script>
