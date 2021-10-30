const express = require('express')
require('dotenv').config();
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())
app.use(express.static('build'))
app.use(express.json())


// Morgan token to be used in POST logging
morgan.token('typePost', function (req, res) { return JSON.stringify(req.body) })
// Default tiny logger, skips if req method is POST
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

    Person.find({}).then(result => {
        // console.log(result);
        const info = result.length
        const time = new Date()
        res.send(`Phonebook has info for ${info} people </br> ${time}`)
    })
        .catch(error => next(error))
})

app.get('/api/persons', (req, res, next) => {
    Person.find({}).then(result => {
        // console.log(result);
        res.json(result)
    })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person) {
                res.json(person)
            } else {
                res.status(404).end()
            }

        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(result => {
            res.status(204).end()
        })
        .catch(error => next(error))
})

const generateId = () => {
    return Math.floor(Math.random() * 99999)
}

app.post('/api/persons', (req, res, next) => {
    const body = req.body
    if (body === undefined) {
        console.log("Body content undefined");
        return res.status(400).json({ error: 'content missing' })
    }
    const person = new Person({
        name: body.name,
        number: body.number
    })
    console.log(`Trying to add ${person} to DB`);
    person.save()
        .then(savedPerson => savedPerson.toJSON())
        .then(savedAndFormattedPerson => res.json(savedAndFormattedPerson))
        .catch(error => next(error))
})

// Update number
app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body

    const person = {
        name: body.bame,
        number: body.number,
    }

    Person.findByIdAndUpdate(req.params.id, person, { new: true })
        .then(updatedPerson => {
            res.json(updatedPerson.toJSON())
        })
        .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
    console.log("-------------- ERROR HAPPENED ---------------- ");
    console.error(error.message)
    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message })
    }
    next(error)
}
app.use(errorHandler)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})