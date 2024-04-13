const fs = require('fs')

const path = require('path')

const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'users.json'
)

const getUsersFromFile = cb => {
  fs.readFile(p, (err, fileContent) => {
    if(err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent))
    }
  })
}

module.exports = class Use{
  constructor(id, firstName, lastName, headline, phone, email, location) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.headline = headline;
    this.phone = phone;
    this.email = email;
    this.location = location;
  }

  save() {
    this.id = Math.random().toString();
    getUsersFromFile (users => {
      users.push(this)
      fs.writeFile(p, JSON.stringify(users), err =>{
        console.log(err)
      })
    })
  }

  static fetchAll(cb) {
    getUsersFromFile(cb)
  }
}