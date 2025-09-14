// Import all models to ensure they are registered with mongoose
import User from "./user";
import Vehicle from "./vehicle";
import Route from "./route";
import Stop from "./stop";
import Schedule from "./schedule";
import Trip from "./trip";
import Requisition from "./requisition";
import Student from "./student";

// Export all models for easy access
export { User, Vehicle, Route, Stop, Schedule, Trip, Requisition, Student };

// This ensures all models are registered when this module is imported
export default {
  User,
  Vehicle,
  Route,
  Stop,
  Schedule,
  Trip,
  Requisition,
  Student,
};
