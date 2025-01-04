require('dotenv').config()

const express = require('express')
const app = express()

const Person = require('./models/person')

// Middleware that allows us to accept requests from ALL origins
const cors = require('cors')
app.use(cors())

// Middleware for whenever Express gets an HTTP GET request it will first
// check if the "dist" directory contains a file corresponding to the request's address.
// If a file is found, Express will return it. 
app.use(express.static('dist'))

const morgan = require('morgan')

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

app.use(requestLogger)

let persons = [
    {
      "id": 1,
      "name": "Arto Hellas",
      "number": "040-123456"
    },
    {
      "id": 2,
      "name": "Ada Lovelace",
      "number": "39-44-5323523"
    },
    {
      "id": 3,
      "name": "Dan Abramov",
      "number": "12-43-234345"
    },
    {
      "id": 4,
      "name": "Mary Poppendieck",
      "number": "39-23-6423122"
    }
]

app.use(express.json()) 
app.use(express.urlencoded({ extended: true }))

morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})


app.get('/info', (request, response) => {
    const date = new Date()
    Person.find({}).then(persons => {
        response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${date}</p>`)
    })
})


app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    })
})

const generateId = () => {
    const maxId = persons.length > 0 ? Math.max(...persons.map(n => n.id)) : 0
    return maxId + 1
}

app.post('/api/persons', (request, response, next) => {
    const body = request.body
    if (!body.name || !body.number) {
        return response.status(400).json({error: 'name or number missing'})
    }

    const person = new Person({
        name: body.name, 
        number: body.number,
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const {name, number} = request.body

    Person.findByIdAndUpdate(request.params.id, {name,number}, { new: true, runValidators: true, context: 'query' })
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))
  })
  

// This defines a middleware function
// This function will be used for catching requests made to non-existent routes.
// For these requests, the middleware will return an error message in json format. 
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}
  
// Middleware
app.use(unknownEndpoint)  
// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)


// Defines a constant variable called PORT and sets it to 3001.
// This is the port number that the server will listen on.
// This logs a message to the console when the server starts successfully.
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})