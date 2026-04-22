import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import formRoutes from "./routes/form.js";

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/form", formRoutes);

app.listen(8000, () => {
  console.log("Server running on port 8000");
});