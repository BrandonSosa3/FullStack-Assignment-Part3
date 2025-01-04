// Import the mongoose library which helps use work with MongoDB
const mongoose = require('mongoose')

// Protect your password
require('dotenv').config();

if (process.argv.length<3) {
    console.log('give password as argument')
    process.exit(1) // Exit process with error code 1
}

// Extract the command line arguments
const [,, password, name, number] = process.argv;

// Create the MongoDB connection URL string
// This includes username, password, cluster address, database name (noteApp)
// and various connection options
const url = MONGODB_URI


// Configure mongoose to be less strict about queries
// This prevents some deprecation warnings
mongoose.set('strictQuery',false)

// Establish connection to MongoDB using the connection URL
// This returns a promise that resolves when connection is successful
mongoose.connect(url)

// Define a schema for the data we want to store in MongoDB
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

// Create a model based on the schema
const Person = mongoose.model('Person', personSchema)

// If only the password is provided, list all phonebook entries
if (name === undefined && number === undefined) {
    Person.find({}).then((persons) => {
      console.log("phonebook:");
      persons.forEach((person) => {
        console.log(`${person.name} ${person.number}`);
      });
      mongoose.connection.close();
    });
  } else if (name && number) {
    // Add new entry to the phonebook
    const person = new Person({ name, number });
  
    person.save().then(() => {
      console.log(`added ${name} number ${number} to phonebook`);
      mongoose.connection.close();
    });
  } else {
    console.log("Invalid input. Please provide a password and optionally a name and number.");
    mongoose.connection.close();
  }