import express from "express";
const router = express.Router();

import {
  getFormOptions,
  submitForm,
  updateForm,
  getActivityById,
  getRopaList,
} from "../controllers/formController.js";

import { authenticate } from "../controllers/authController.js";

// options ไม่ต้อง login
router.get("/options", getFormOptions);

// list + detail
router.get("/ropa", authenticate, getRopaList);
router.get("/activity/:activityId", authenticate, getActivityById);

// submit/update
router.post("/submit", authenticate, submitForm);
router.put("/update/:activityId", authenticate, updateForm);

export default router;