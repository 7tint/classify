<template lang="html">
  <div class="">
    <router-link class="btn btn-primary" :to="{name: 'preferenceIndex'}">Preferences</router-link>
    <br/>
    <router-link class="btn btn-primary" :to="{name: 'courseIndex'}">Courses</router-link>
    <br/>
    <router-link class="btn btn-primary" :to="{name: 'teacherIndex'}">Teachers</router-link>
    <br/>
    <router-link class="btn btn-primary" :to="{name: 'departmentIndex'}">Departments</router-link>
  </div>
</template>

<script>
export default {
}
</script>
