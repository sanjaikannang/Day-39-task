const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");

const Mentor = require("./models/Mentor");
const Student = require("./models/Student");

const app = express();

app.use(bodyParser.json());

const PORT = 3000 ;

const DB_URL = "mongodb+srv://studentmentor:stud123@cluster0.3rf1qjc.mongodb.net/?retryWrites=true&w=majority";

//Connect to MongoDB
mongoose
  .connect(DB_URL, {})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Could not connect to MongoDB", err));

// API to create Mentor
  app.post("/mentor", async (req, res) => {
    try {
      const mentor = new Mentor(req.body);
      await mentor.save();
      res.status(201).send(mentor);
    } catch (error) {
      res.status(400).send(error);
    }
  });
  
  // API to create Student
  app.post("/student", async (req, res) => { 
    try {
      const student = new Student(req.body);
      await student.save();
      res.status(201).send(student);
    } catch (error) {
      res.status(400).send(error);
    }
  });

  //API to Assign a student to Mentor
  app.post("/mentor/:mentorId/assign", async (req, res) => {
    try {
      const mentor = await Mentor.findById(req.params.mentorId);
      const students = await Student.find({ _id: { $in: req.body.students } });
  
      students.forEach((student) => {
        student.cMentor = mentor._id;
        student.save();
      });
  
      mentor.students = [
        ...mentor.students,
        ...students.map((student) => student._id),
      ];
      await mentor.save();
      res.send(mentor);
    } catch (error) {
      res.status(400).send(error);
    }
  });

 //API to Assign or Change Mentor for particular Student
  app.put("/student/:studentId/assignMentor/:mentorId", async (req, res) => {
    try {
      const mentor = await Mentor.findById(req.params.mentorId);
      const student = await Student.findById(req.params.studentId);
  
      if (student.cMentor) {
        student.pMentor.push(student.cMentor);
      }
  
      student.cMentor = mentor._id;
      await student.save();
      res.send(student);
    } catch (error) {
      res.status(400).send(error);
    }
  });
  
//API to show all students for a particular mentor
 app.get("/mentor/:mentorId/students", async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.mentorId).populate(
      "students"
    );
    res.send(mentor);
  } catch (error) {
    res.status(400).send(error);
  }
});

//API to show the previously assigned mentor for a particular student.
app.get('/student/:studentId/pmentor',async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    const previousMentorId = student.previousMentor;

    if (!previousMentorId) {
      return res.status(404).json({ message: 'No previous mentor found for this student' });
    }
    const previousMentor = await Mentor.findById(previousMentorId);

    if (!previousMentor) {
      return res.status(404).json({ error: 'Previous mentor not found' });
    }
    res.status(200).json(previousMentor);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

  app.listen(PORT, () => {
    console.log("Server is running on PORT", PORT);
  });
  

