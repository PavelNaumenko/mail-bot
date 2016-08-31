import mongoose from 'mongoose';

let mailSchema = mongoose.Schema({

	messageId: {

		type: String,
		default: '',
		index: { unique: true }

	},

	envelope: {

		type: Object,
		default: {}

	},

	old: {

		type: Boolean,
		default: false

	}

}, { versionKey: false });

export default mongoose.model('mail', mailSchema);
