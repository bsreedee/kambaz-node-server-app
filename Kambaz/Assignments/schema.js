import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    _id: String,         
    title: String,
    description: String,
    course: String,       
    points: Number,
    start: Date,         
    end: Date,            
    availableUntil: Date, 
    modules: [String],   
  },
  { collection: "assignments" }
);

export default assignmentSchema;
