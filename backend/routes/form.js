import express from "express";
const router = express.Router();

import {
  getFormOptions,
  submitForm,
  updateForm,
  getActivityById,
} from "../controllers/formController.js";

import { authenticate } from "../controllers/authController.js";

// options ไม่ต้อง login
router.get("/options", getFormOptions);

// อันอื่นยังต้อง login
router.get("/activity/:activityId", authenticate, getActivityById);
router.post("/submit", authenticate, submitForm);
router.put("/update/:activityId", authenticate, updateForm);

export default router;