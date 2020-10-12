const mongoose = require('mongoose');

const preferencesSchema = new mongoose.Schema({
  hasTeachers: {
    type: Boolean,
    required: true
  },
  hasDepartments: {
    type: Boolean,
    required: true
  },
  isPublic: {
    type: Boolean,
    required: true
  },
  isAnonymous: {
    type: Boolean,
    required: true
  },
  course: {
  	hasMetrics: {
      type: Boolean,
      required: true
    },
  	hasComments: {
      type: Boolean,
      required: true
    }
  },
  teacher: {
    hasMetrics: {
      type: Boolean,
      required: true
    },
  	hasComments: {
      type: Boolean,
      required: true
    }
  }
});

module.exports = mongoose.model('Preferences', preferencesSchema);
