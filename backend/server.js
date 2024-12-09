const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = 3000;
const JWT_SECRET = "your_secret_key"; // Use a strong, random key for production

// MongoDB connection
mongoose.connect("mongodb://mongo:27017/attendance", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  firstName: String,
  lastName: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

// Student Schema
const studentSchema = new mongoose.Schema({
  professorId: mongoose.Schema.Types.ObjectId,
  name: String,
});

const Student = mongoose.model("Student", studentSchema);

// Middleware to Authenticate Token
function authenticateToken(req, res, next) {
  const token = req.headers["token"];
  if (!token) return res.status(401).json({ error: "Access Denied" });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.userId = verified.userId; // Add userId to request object for use in routes
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid Token" });
  }
}

// User Registration
app.post("/register", async (req, res) => {
  const { email, firstName, lastName, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = new User({ email, firstName, lastName, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: "Email already exists" });
  }
});

// User Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token, userId: user._id });
});

// Add Student
app.post("/students", authenticateToken, async (req, res) => {
  const { name } = req.body;

  try {
    const student = new Student({ professorId: req.userId, name });
    await student.save();
    res.status(201).json({ message: "Student added successfully" });
  } catch (err) {
    res.status(400).json({ error: "Failed to add student" });
  }
});

// Get Students
app.get("/students", authenticateToken, async (req, res) => {
  try {
    const students = await Student.find({ professorId: req.userId });
    res.json(students);
  } catch (err) {
    res.status(400).json({ error: "Failed to fetch students" });
  }
});

// Update Student
app.put("/students/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    await Student.findByIdAndUpdate(id, { name });
    res.json({ message: "Student updated successfully" });
  } catch (error) {
    res.status(400).json({ error: "Failed to update student" });
  }
});

// Delete Student
app.delete("/students/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await Student.findByIdAndDelete(id);
    res.json({ message: "Student removed successfully" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete student" });
  }
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));

