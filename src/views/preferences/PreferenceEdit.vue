<template>
  <form @submit.prevent="editPreferences()">
    <router-link class="btn btn-primary" :to="{name: 'home'}">Home</router-link>
    <router-link class="btn btn-primary" :to="{name: 'preferenceIndex'}">Preferences</router-link>
    <h5 class="mb-3">Course Catalogue Configurations: <br/></h5>
    <div class="form-group">
      <div class="pr-3">Is Public:</div>
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" v-model="preferences.isPublic" id="public-1" value="true" required>
        <label class="form-check-label" for="public-1">True</label>
      </div>
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" v-model="preferences.isPublic" id="public-2" value="false">
        <label class="form-check-label" for="public-2">False</label>
      </div>
    </div>
    <div class="form-group">
      <div class="pr-3">Force Anonymous Reviews:</div>
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" v-model="preferences.isAnonymous" id="anonymousReviews-1" value="true" required>
        <label class="form-check-label" for="anonymousReviews-1">True</label>
      </div>
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" v-model="preferences.isAnonymous" id="anonymousReviews-2" value="false">
        <label class="form-check-label" for="anonymousReviews-2">False</label>
      </div>
    </div>
    <div class="form-group">
      <div class="pr-3">Course Metrics:</div>
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" v-model="preferences.course.hasMetrics" id="course-hasMetrics-1" value="true" required>
        <label class="form-check-label" for="course-hasMetrics-1">True</label>
      </div>
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" v-model="preferences.course.hasMetrics" id="course-hasMetrics-2" value="false">
        <label class="form-check-label" for="course-hasMetrics-2">False</label>
      </div>
    </div>
    <div class="form-group">
      <div class="pr-3">Course Comments:</div>
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" v-model="preferences.course.hasComments" id="course-hasComments-1" value="true" required>
        <label class="form-check-label" for="course-hasComments-1">True</label>
      </div>
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" v-model="preferences.course.hasComments" id="course-hasComments-2" value="false">
        <label class="form-check-label" for="course-hasComments-2">False</label>
      </div>
    </div>
    <div class="form-group">
      <div class="pr-3">Approve Course Comments:</div>
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" v-model="preferences.course.approveComments" id="approveCourseComments-1" value="true" required>
        <label class="form-check-label" for="approveCourseComments-1">True</label>
      </div>
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" v-model="preferences.course.approveComments" id="approveCourseComments-2" value="false">
        <label class="form-check-label" for="approveCourseComments-2">False</label>
      </div>
    </div>
    <div class="form-group">
      <div class="pr-3">Teacher Metrics:</div>
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" v-model="preferences.teacher.hasMetrics" id="teacher-hasMetrics-1" value="true" required>
        <label class="form-check-label" for="teacher-hasMetrics-1">True</label>
      </div>
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" v-model="preferences.teacher.hasMetrics" id="teacher-hasMetrics-2" value="false">
        <label class="form-check-label" for="teacher-hasMetrics-2">False</label>
      </div>
    </div>
    <div class="form-group">
      <div class="pr-3">Teacher Comments:</div>
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" v-model="preferences.teacher.hasComments" id="teacher-hasComments-1" value="true" required>
        <label class="form-check-label" for="teacher-hasComments-1">True</label>
      </div>
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" v-model="preferences.teacher.hasComments" id="teacher-hasComments-2" value="false">
        <label class="form-check-label" for="teacher-hasComments-2">False</label>
      </div>
    </div>
    <div class="form-group">
      <div class="pr-3">Approve Teacher Reviews:</div>
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" v-model="preferences.teacher.approveComments" id="approveTeacherComments-1" value="true" required>
        <label class="form-check-label" for="approveTeacherComments-1">True</label>
      </div>
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" v-model="preferences.teacher.approveComments" id="approveTeacherComments-2" value="false">
        <label class="form-check-label" for="approveTeacherComments-2">False</label>
      </div>
    </div>
    <button type="submit" class="btn btn-primary">Save Changes</button>
  </form>
</template>

<script>
  export default {
    data() {
      return {
        preferences: {
          course: {
            hasMetrics: undefined,
            hasComments: undefined,
            approveComments: undefined
          },
          teacher: {
            hasMetrics: undefined,
            hasComments: undefined,
            approveComments: undefined
          }
        }
      }
    },
    created() {
      let uri = `http://127.0.0.1:3000/api/preferences/`;
      this.axios.get(uri).then((response) => {
        this.preferences = response.data.preferences;
      });
    },
    methods: {
      editPreferences() {
        let uri = `http://127.0.0.1:3000/api/preferences/`;
        this.axios.put(uri, {preferences: this.preferences}).then(() => {
          this.$router.push({name: "preferenceIndex"});
        });
      }
    }
  }
</script>
