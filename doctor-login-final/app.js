//mongodb+srv://pppran23:JvnHuK11MRQ6EenI@cluster0.kj7ri1p.mongodb.net/?retryWrites=true&w=majority
const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const session = require('express-session');
const ejs = require('ejs');

// Middleware that checks for a valid session ID on every request

const app = express();
app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: false
}));
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://pppran23:JvnHuK11MRQ6EenI@cluster0.kj7ri1p.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 3000, // Increase timeout to 3 seconds
});
const doctorSchema = new mongoose.Schema({
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
//     relationship: 'Spouse'
//   }
//   appointmentS
// });

// patientEhr.save()
//   .then(() => {
//     console.log('Patient created successfully');
//   })
//   .catch((error) => {
//     console.error(error);
//   });
const Doctor = mongoose.model('Doctor', doctorSchema);

app.get('/', (req, res) => {
  console.log("Entered main page")
res.sendFile(__dirname+'/index.html');
});
var count = 0;
app.get("/patient-search", (req, res)=>{
  console.log("Get Entered in patient-search")
  if (req.session.email&&count<1) {
    console.log(req.session.email);
    count = count + 1;
    req.session.email = 0;
    // If logged in, send the dashboard file
    res.sendFile(__dirname + '/search.html');
  } else {
    count = 0
    res.redirect("/");
    // If not logged in, redirect to the login page
  }
});
app.get('/new-patient-added', (req, res)=>{
  res.send("<h1>Please login using login portal</h1>")
})
app.post('/new-patient-added', (req, res)=>{
  const patientData = req.body;
  const newPatient = new PatientEhr(patientData);

  newPatient.save()
  .then((x)=>
  {
    res.send('Patient added successfully');
  })
  .catch((err)=>{
    res.status(400).send(err);
  });

  });


app.post("/patient-search", (req, res)=>{
  if(req.body.button1){
    console.log("Entered Button1 in patient search");
    PatientEhr.findOne({email: req.body.email1})
    .then((patient)=>{
      console.log("x ="+ patient );
      if(patient){
          res.render('patient_ehr_details', { patient });}
          else{
            res.send("<h1>No EHR yet, please contact your health care professional.");
          }})
    .catch((err) => {
      console.log(err);
    })}
    if(req.body.button2){
        res.sendFile(__dirname+"/patient.html");
    }
    if(req.body.button3){
      console.log("entered button 3")
      PatientEhr.findOne({email: req.body.email})
      .then((patient) => {  
        console.log(patient);
        res.render('edit_patient_details', { patient });})
      .catch((err)=>
        {
          console.error(err);
          res.send('An error occurred');
        })
        
}});
app.get("/edit-patient-ehr", (req, res)=>{
  res.send("<h1>Please login to enter this page!</h1>");
});
app.post("/edit-patient-ehr", (req, res)=>
{
  const patientData = req.body;
  const newPatient = new PatientEhr(patientData);
  PatientEhr.replaceOne(
    { email:req.body.email },patientData).then((x)=>
  {
    res.send('<h1>Document updated successfully!</h1>');
  })
  .catch((err)=>{
    console.log(err);
  });

})
app.post("/", function(req, res){
  if(req.body.button1){
    Doctor.findOne({email: req.body.email, password: req.body.password})
    .then((x) => {
      console.log(x);
      if (x) {

        console.log("Successfully logged in!");
        // If correct, store the username in the session
        req.session.email = x.email;
        // Redirect the user to the dashboard page
        res.redirect('/patient-search');
          }
      else{
        res.send("<h2>Sorry! User does not exist. Please check the login detais or contact the server side.</h2>");
      }
      })
        .catch((err)=>{
          console.log(err);
        });
      }
    })


app.get("/signup", function(req, res){
    res.sendFile(__dirname+'/signup.html');
    console.log("entered");
});
app.post("/signup", function(req, res){
  console.log(req.body.email);
  console.log("entered2");
Doctor.findOne({ email: req.body.email })
  .then((x) => {
    if (x) {
      console.log("Given mail already exists. Please login!");
      res.send("Account Already Exist. Please login!");
    } else {
      const doctor = new Doctor({
        fName: req.body.first_name,
        lName: req.body.last_name,
        email: req.body.email,
        password: req.body.password,
        
      });
        doctor.save();
        console.log("You have successfully signed up.");
        res.sendFile(__dirname+"/search.html");
    }
  })
  .catch((err) => {
    console.log(err);
  });
});

  app.listen(3000, function(){
  console.log("Server is running on port 3000");
});

