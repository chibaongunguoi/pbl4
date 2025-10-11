import mongoose from "mongoose";

const JobDetailSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  thumbnail: {
    type: String,
  },
  job_title: {
    type: String,
    required: true,
  },
  company_url: {
    type: String,
  },
  company_name: {
    type: String,
  },
  province: {
    type: String,
    required: true,
  },
  salary: {
    type: String,
  },
  skills: {
    type: [String],
    default: [],
  },
  descriptions: {
    type: Map,
    of: String,
  },
  job_info: {
    type: Map,
    of: String,
  },
  collected_at: {
    type: Date,
    default: Date.now,
  },
});

const JobDetail = mongoose.models.JobDetail || mongoose.model("JobDetail", JobDetailSchema, "JobDetail");

export default JobDetail;
