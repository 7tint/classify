<template>
  <form @submit.prevent="postDepartment()">
    <h5 class="mb-3">Add Department</h5>
    <div class="form-row">
      <div class="col">
        <div class="form-group">
          <label for="name">Department Name</label>
          <input type="text" class="form-control" v-model="department.name" id="name" placeholder="Department Name" required>
        </div>
      </div>
    </div>
    <div class="form-group">
      <label for="description">Department Description</label>
      <textarea class="form-control" v-model="department.description" id="description" rows="3"></textarea>
    </div>
    <button type="submit" class="btn btn-primary">Add Department</button>
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
        department: {}
      }
    },
    methods: {
      postDepartment() {
        let uri = `http://127.0.0.1:3000/api/departments/`;
        this.axios.post(uri, this.department).then(() => {
          this.$router.push({name: "departmentIndex"});
        });
      }
    }
  }
</script>
