const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      maxlength: [120, 'Email cannot exceed 120 characters'],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Invalid phone number'],
    },
    userType: {
      type: String,
      required: [true, 'User type is required'],
      enum: {
        values: ['Student', 'Customer', 'Other'],
        message: 'User type must be Student, Customer or Other',
      },
    },
    interest: {
      type: String,
      required: [true, 'Service or course of interest is required'],
      trim: true,
      minlength: [2, 'Interest must be at least 2 characters'],
      maxlength: [120, 'Interest cannot exceed 120 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['New', 'Contacted', 'In Progress', 'Closed'],
        message: 'Invalid status',
      },
      default: 'New',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Enquiry', enquirySchema);
