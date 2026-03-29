// Database Setup Script — PostgreSQL
// Run this once AFTER starting the server (which creates the tables) to seed sample data.
// Alternatively tables are auto-created on first server start via initializeDatabase().

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool(
    process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
          }
        : {
            host:     process.env.PGHOST     || 'localhost',
            port:     parseInt(process.env.PGPORT || '5432'),
            database: process.env.PGDATABASE || 'blue_ocean_strategies',
            user:     process.env.PGUSER     || 'postgres',
            password: process.env.PGPASSWORD || ''
          }
);

async function setupDatabase() {
    console.log('🔧 Setting up Political Marketing Platform database...');

    try {
        // Create sample campaign
        const sampleCampaign = {
            campaign_name: 'Vote for Change 2026',
            candidate_name: 'Sarah Johnson',
            office: 'Mayor',
            location: 'Springfield, IL',
            website_url: 'https://voteforchange2026.com',
            primary_color: '#1e3a8a',
            secondary_color: '#3b82f6',
            status: 'active',
            seo_title: 'Sarah Johnson for Mayor - Vote for Change 2026',
            seo_description: 'Join Sarah Johnson\'s campaign for Mayor of Springfield. Together we can create positive change for our community.',
            seo_keywords: 'Sarah Johnson, Mayor, Springfield, Illinois, campaign, vote, election 2026',
            contact_email: 'info@voteforchange2026.com',
            contact_phone: '(555) 123-4567',
            contact_address: '123 Campaign St, Springfield, IL 62701',
            social_facebook: 'https://facebook.com/sarahjohnson2026',
            social_twitter: 'https://twitter.com/sarah2026',
            social_instagram: 'https://instagram.com/sarahjohnson2026'
        };

        await new Promise((resolve, reject) => {
            db.run(`
                INSERT OR REPLACE INTO campaigns (
                    campaign_name, candidate_name, office, location, website_url,
                    primary_color, secondary_color, status, seo_title, seo_description,
                    seo_keywords, contact_email, contact_phone, contact_address,
                    social_facebook, social_twitter, social_instagram
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, Object.values(sampleCampaign), function(err) {
                if (err) {
                    reject(err);
                } else {
                    console.log('✅ Sample campaign created with ID:', this.lastID);
                    resolve();
                }
            });
        });

        // Create admin user
        const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeThisPassword123!';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        await new Promise((resolve, reject) => {
            db.run(`
                INSERT OR REPLACE INTO admin_users (
                    username, email, password_hash, role, active
                ) VALUES (?, ?, ?, ?, ?)
            `, [
                process.env.ADMIN_USERNAME || 'admin',
                process.env.ADMIN_EMAIL || 'admin@yourmarketingfirm.com',
                hashedPassword,
                'admin',
                1
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    console.log('✅ Admin user created with ID:', this.lastID);
                    console.log('📝 Username:', process.env.ADMIN_USERNAME || 'admin');
                    console.log('🔑 Password:', adminPassword);
                    resolve();
                }
            });
        });

        // Add some sample contact submissions for demo
        const sampleContacts = [
            {
                first_name: 'John',
                last_name: 'Smith',
                email: 'john.smith@email.com',
                phone: '(555) 987-6543',
                interest: 'volunteering',
                message: 'I would like to volunteer for the campaign. I have experience in phone banking and door-to-door canvassing.',
                newsletter_signup: 1,
                utm_source: 'facebook',
                utm_medium: 'social',
                utm_campaign: 'spring2026'
            },
            {
                first_name: 'Maria',
                last_name: 'Garcia',
                email: 'maria.garcia@email.com',
                phone: '(555) 456-7890',
                interest: 'information',
                message: 'Can you provide more information about your stance on education policy?',
                newsletter_signup: 1,
                utm_source: 'google',
                utm_medium: 'search',
                utm_campaign: 'education'
            },
            {
                first_name: 'David',
                last_name: 'Wilson',
                email: 'david.wilson@email.com',
                interest: 'event',
                message: 'When is the next town hall meeting? I would like to attend.',
                newsletter_signup: 0,
                utm_source: 'website',
                utm_medium: 'direct'
            }
        ];

        for (const contact of sampleContacts) {
            await new Promise((resolve, reject) => {
                db.run(`
                    INSERT INTO contact_submissions (
                        first_name, last_name, email, phone, interest, message,
                        newsletter_signup, utm_source, utm_medium, utm_campaign
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    contact.first_name, contact.last_name, contact.email, contact.phone,
                    contact.interest, contact.message, contact.newsletter_signup,
                    contact.utm_source, contact.utm_medium, contact.utm_campaign
                ], function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }

        console.log('✅ Sample contact submissions added');

        // Add newsletter subscribers
        const newsletterSubscribers = [
            { email: 'subscriber1@email.com', first_name: 'Alice', last_name: 'Brown' },
            { email: 'subscriber2@email.com', first_name: 'Bob', last_name: 'Johnson' },
            { email: 'subscriber3@email.com', first_name: 'Carol', last_name: 'Davis' }
        ];

        for (const subscriber of newsletterSubscribers) {
            await new Promise((resolve, reject) => {
                db.run(`
                    INSERT OR IGNORE INTO newsletter_subscribers (
                        email, first_name, last_name, source
                    ) VALUES (?, ?, ?, ?)
                `, [subscriber.email, subscriber.first_name, subscriber.last_name, 'manual'], function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }

        console.log('✅ Newsletter subscribers added');
        console.log('🎉 Database setup completed successfully!');
        console.log('\n📊 Next steps:');
        console.log('1. Copy .env.example to .env and configure your settings');
        console.log('2. Run "npm install" to install dependencies');
        console.log('3. Run "npm run dev" to start the development server');
        console.log('4. Visit http://localhost:3000 to see your site');
        console.log('5. Visit http://localhost:3000/admin to access the admin panel');
        console.log('\n🔐 Admin Credentials:');
        console.log('Username:', process.env.ADMIN_USERNAME || 'admin');
        console.log('Password:', adminPassword);

    } catch (error) {
        console.error('❌ Database setup failed:', error);
    } finally {
        db.close();
    }
}

// Run setup if this file is executed directly
if (require.main === module) {
    setupDatabase();
}

module.exports = setupDatabase;