require('dotenv').config();
const { Pool } = require('pg');
const p = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false });
Promise.all([
    p.query("DELETE FROM contact_submissions WHERE email IN ('john.smith@email.com','maria.garcia@email.com','david.wilson@email.com')"),
    p.query("DELETE FROM newsletter_subscribers WHERE email IN ('subscriber1@email.com','subscriber2@email.com','subscriber3@email.com')")
]).then(function(results) {
    console.log('Contacts deleted:', results[0].rowCount);
    console.log('Subscribers deleted:', results[1].rowCount);
    p.end();
}).catch(function(e) {
    console.error('DB Error:', e.message);
    p.end();
    process.exit(1);
});
