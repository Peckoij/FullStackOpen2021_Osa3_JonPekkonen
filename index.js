const express = require('express')
require('dotenv').config();
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))

// Morgan token to be used in POST logging
morgan.token('typePost', function (req, res) { return JSON.stringify(req.body) })
// Default tiny logger, skips if request method is POST
app.use(morgan('tiny', {
    skip: function (req, res) { return req.method === "POST" }
}))

// Morgan logging used when req.method is POST, all others are skipped
app.use(morgan(function (tokens, req, res) {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens.typePost(req, res), ''
    ].join(' ')
}, {
    skip: function (req, res) { return req.method != "POST" }
}))


app.get('/info', (req, res) => {
    let info = persons.length
    let time = new Date()
    res.send(`Phonebook has info for ${info} people </br> ${time}`)
})

app.get('/api/persons', (req, res) => {
    Person.find({}).then(result => {
        // console.log(result);
        res.json(result)
    })
})

app.get('/api/persons/:id', (req, res) => {
    Person.findById(req.params.id).then(person => {
        res.json(person)
    })
    /*
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }*/
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

const generateId = () => {
    return Math.floor(Math.random() * 99999)
}

app.post('/api/persons', (request, response) => {
    const body = request.body
    console.log(body);

    if (body === undefined) {
        console.log("Body content undefined");
        return response.status(400).json({ error: 'content missing' })
    }
    /*
    if (persons.some(person => person.name === body.name)) {
        // console.log("Name already exists");
        return response.status(400).json({
            error: 'Name already exists'
        })
    } */
    const person = new Person({
        name: body.name,
        number: body.number
    })
    console.log(`Trying to add ${person} to DB`);
    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})