//mongodb+srv://pppran23:JvnHuK11MRQ6EenI@cluster0.kj7ri1p.mongodb.net/?retryWrites=true&w=majority
const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const ejs = require('ejs');

app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs')

mongoose.connect('mongodb+srv://pppran23:JvnHuK11MRQ6EenI@cluster0.kj7ri1p.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 3000, // Increase timeout to 3 seconds
});
const patientSchema = new mongoose.Schema({
  fName:{
    type: String,
    required: [true, 'Please check the first name entry, no name specified.']
  },
  lName:{
    type: String,
    required: [true, 'Please check the last name entry, no name specified.']
  },
  email: {
    type: String,
    required: [true, 'Please check the email name entry, no name specified.'],
    unique: true 
  },
  password: {
    type: String,
    required: [true, 'Please check the password entry']
  }
});

const patientEhrSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  address: {
  type: String
  },
  medicalHistory: {
    type: String,
    required: true
  },
  medications: [{
    name: {
      type: String,
      required: true
    },
    dosage: {
      type: String,
      required: true
    }
  }],
  allergies: [{
    type: String,
    required: true
  }],
  bloodType: {
    type: String,
    enum: ['A', 'B', 'AB', 'O'],
    required: true
  },
  emergencyContact: {
    name: {
      type: String,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true
    }
  },
  appointmentScheduled:{
    appointment1: {
      type: String,
      default: "None"
    },
    appointment2: {
      type: String,
      default: "None"
    }, 
    appointment3: {
      type: String,
      default: "None"
    }  
  }
});


const PatientEhr = mongoose.model('PatientEhr', patientEhrSchema);

// const patientEhr = new PatientEhr({
//   firstName: 'John',
//   lastName: 'Doe',
//   gender: 'male',
//   dateOfBirth: '1990-01-01',
//   email: 'johndoe@example.com',
//   phoneNumber: '123-456-7890',
//   address: '123 Main St',
//   medicalHistory: 'No major medical conditions',
//   medications: [{
//     name: 'Ibuprofen',
//     dosage: '200mg'
//   }],
//   allergies: ['Peanuts', 'Shellfish'],
//   bloodType: 'A',
//   emergencyContact: {
//     name: 'Jane Doe',
//     phoneNumber: '123-456-7890',
//   },
//   appointmentScheduled: {
//     appointment1:'23 May 2023 - with Dr. Michelle'
//   }
// });


Patient = mongoose.model('Patient', patientSchema);


app.get('/', (req, res) => {
res.sendFile(__dirname+'/index.html');
});

app.post("/", function(req, res){
  if(req.body.button1){
    Patient.findOne({email: req.body.email, password: req.body.password})
    .then((x) => {
      if (x) {
        console.log("Successfully Logged in!");
        PatientEhr.findOne({email: x.email})
        .then((patient)=>{
          console.log("x ="+ patient );
      if(patient){
          res.render('patient_ehr_details', { patient });}
          else{
            res.send("<h1>No EHR yet, please contact your health care professional.");
          }})        
          .catch((err)=>{
          console.log(err);
        });

      } else {
          res.send("<h1> Please Sign in!");
        }
      })
    .catch((err) => {
      console.log(err);
    });
  }
  else{
    console.log("Wrong Password")
  }
});

app.get("/signup", function(req, res){
    res.sendFile(__dirname+'/signup.html');
});
app.post("/signup", function(req, res){
  
Patient.findOne({ email: req.body.email })
  .then((x) => {
    if (x) {
      console.log("Given mail already exists. Try again!");
      res.redirect("/");
    } else {
      const patient = new Patient({
        fName: req.body.first_name,
        lName: req.body.last_name,
        email: req.body.email,
        password: req.body.password,
      });
      patient.save();
      console.log("You have successfully signed up.");
      res.send("You have successfully signed up.");
    }
  })
  .catch((err) => {
    console.log(err);
  });
});
  app.listen(3000, function(){
  console.log("Server is running on port 3000");
});

