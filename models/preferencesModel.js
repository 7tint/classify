const mongoose = require('mongoose');

const coursePreferencesSchema = new mongoose.Schema({
  hasDescription: {
    type: Boolean,
    required: true
  },
	hasPace: {
    type: Boolean,
    required: true
  },
	hasAntiReq: {
    type: Boolean,
    required: true
  },
	hasCoreReq: {
    type: Boolean,
    required: true
  },
	hasMetrics: {
    type: Boolean,
    required: true
  },
	hasComments: {
    type: Boolean,
    required: true
  }
});

module.exports = mongoose.model('CoursePreferences', coursePreferencesSchema);
