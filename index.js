const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

// Middleware methods

app.use(express.json())
morgan.token('body', (req, res) => {
    return JSON.stringify(req.body)
})
// using tiny + custom made 'body' token
app.use(morgan(':method :url :status - :response-time ms :body'))
app.use(cors())
app.use(express.static('build'))

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
    res.json(persons)
})

app.get('/info', (req, res) => {
    let phonebookLength = `<p>Phonebook has info for ${persons.length} people</p>`
    let date = new Date()
    let dateMessage = `<p>${date}</p>`
    const message = phonebookLength + dateMessage
    res.send(message)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(pers => pers.id === id)

    if(person){
       res.json(person) 
    }
    else{
        res.status(404).end()
    }
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)
    res.status(204).end()
})

app.post('/api/persons', (req, res) => {
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

    const person = {
        "id": Math.floor(Math.random() * 10000),
        "name": data.name,
        "number": data.number
    }
    persons = persons.concat(person)
    console.log(persons)
    res.status(201).end()
})



const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})