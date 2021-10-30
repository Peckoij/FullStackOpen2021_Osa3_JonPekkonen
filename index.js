const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())
app.use(express.json())

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


let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    }
]

app.get('/', (req, res) => {
    res.send('<h1>Hello Visitor!</h1>')
})

app.get('/info', (req, res) => {
    let info = persons.length
    let time = new Date()
    res.send(`Phonebook has info for ${info} people </br> ${time}`)
})

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
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
    // console.log(body);
    if (persons.some(person => person.name === body.name)) {
        // console.log("Name already exists");
        return response.status(400).json({
            error: 'Name already exists'
        })
    }
    if (body.name && body.number) {
        const person = {
            name: body.name,
            number: body.number,
            id: generateId(),
        }
        persons = persons.concat(person)
        // console.log(`${person.name} added to phone book`);
        return response.json(person)
    }
    else {
        return response.status(400).json({
            error: 'content missing'
        })
    }
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})