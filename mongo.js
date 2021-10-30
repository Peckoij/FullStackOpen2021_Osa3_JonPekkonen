const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
// `mongodb+srv://fullstack:${password}@cluster0-ostce.mongodb.net/test?retryWrites=true`
`mongodb+srv://fullstact:${password}@cluster0.qrv7j.mongodb.net/puhelinluettelo-tietokanta?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)


if (process.argv.length === 5) {
console.log("Adding new entry to phonebook");
const newName = process.argv[3]
const newNumber = process.argv[4]

const person = new Person({
    name: newName,
    number: newNumber
})

person.save().then(response => {
  console.log(`Added ${response.name} number ${response.number} to phonebook`)
  mongoose.connection.close()
})
} 
else if (process.argv.length === 3) {
    console.log("Finding all entries in phonebook");
    console.log(`Phonebook:`)
    Person.find({}).then(result => {
        
        result.forEach(person => {
          console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
      })
}else { 
    console.log("Please give command in following format:")
    console.log("Get phonebook: node mongo.js <yourpassword>");
    console.log("Add new name: node mongo.js <yourpassword> <name> <number>");
    mongoose.connection.close()
}