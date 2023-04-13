require('dotenv').config()
const express = require('express')
const Person = require('./models/person')
const app = express()

// Middleware methods

app.use(express.static('build'))
app.use(express.json())

const morgan = require('morgan')
morgan.token('body', (req, res) => {
    return JSON.stringify(req.body)
})
// using tiny + custom made 'body' token
app.use(morgan(':method :url :status - :response-time ms :body'))

const cors = require('cors')
app.use(cors())

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

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.get('/info', (req, res) => {
    Person.find({}).then(persons => {
        let phonebookLength = `<p>Phonebook has info for ${persons.length} people</p>`
        let date = new Date()
        let dateMessage = `<p>${date}</p>`
        const message = phonebookLength + dateMessage
        res.send(message)
    })
})  

app.get('/api/persons/:id', (req, res, next) => {
    const id = req.params.id
    Person.findById(id).then(person => {
        if(person){
            res.json(person)
        }else{
            res.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    const id = req.params.id
    Person.findByIdAndRemove(id).then(result => {
        if(result){
            res.status(204).end()
        }else{
            res.statusMessage = `No person exists with id ${id}`
            res.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
    const data = req.body

    if(!data.name || !data.number){
        return res.status(400).json({
            error: 'Name or number is missing'
        })
    }

    if(persons.find(person => person.name === data.name)){
        return res.status(400).json({
            error: 'Name must be unique'
        })
    }

    const person = new Person({
        "name": data.name,
        "number": data.number
    })

    person.save().then(savedPerson => {
        res.status(201)
        res.json(savedPerson)
    }).catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    const {name, number} = req.body
    const id = req.params.id

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(id, {name, number}, {new: true, runValidators: true, context: 'query'})
        .then(updatedPerson => {
            res.json(updatedPerson)
        })
        .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
    res.status(404).send({error: 'unknown endpoint'})
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHander = (error, req, res, next) => {
    console.log(error.message)

    if(error.name === 'CastError'){
        return res.status(400).send({error: 'malformatted id'})
    }
    else if(error.name === 'ValidationError'){
        return res.status(400).send({error: error.message})
    }

    next(error)
}

app.use(errorHander)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})