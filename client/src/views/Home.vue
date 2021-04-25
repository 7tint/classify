<template lang="html">
  <div class="">
    <router-link class="btn m-4 btn-primary" :to="{name: 'preferenceIndex'}">Preferences</router-link>
    <br/>
    <router-link class="btn m-4 btn-secondary" :to="{name: 'courseIndex'}">Courses</router-link>
    <br/>
    <router-link class="btn m-4 btn-success" :to="{name: 'teacherIndex'}">Teachers</router-link>
    <br/>
    <router-link class="btn m-4 btn-danger" :to="{name: 'departmentIndex'}">Departments</router-link>
    <br/>
    <router-link class="btn m-4 btn-warning" :to="{name: 'home'}">No Shadow</router-link>
    <br/>
    <router-link class="btn m-4 btn-info shadow-sm" :to="{name: 'home'}">Small Shadow</router-link>
    <br/>
    <router-link class="btn m-4 btn-light shadow" :to="{name: 'home'}">Medium Shadow</router-link>
    <br/>
    <router-link class="btn m-4 btn-dark shadow-lg" :to="{name: 'home'}">Large Shadow</router-link>
  </div>
</template>

<script>
export default {
}
</script>
