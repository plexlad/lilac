var Loki = require('lokijs'),
    db = new Loki('lilac.db');

// Grabs the poll database, returns null if it does not exist
var poll = db.getCollection('poll');

// If poll returns null, creates the collection with the "main" entry
if (poll) {
    poll = db.addCollection('poll');
    let main = poll.insert({ name: 'main', data: [], messageIds: []});
    poll.update(main);
    db.saveDatabase();
}

module.exports = {
    db,
    poll
}