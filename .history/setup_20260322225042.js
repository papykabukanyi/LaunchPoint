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
    console.log('🔧 Setting up Blue Ocean Strategies PostgreSQL database...');

    try {
        // Insert sample campaign (ignore if one already exists)
        const campaignRes = await pool.query(`
            INSERT INTO campaigns (
                campaign_name, candidate_name, office, location, website_url,
                primary_color, secondary_color, status, seo_title, seo_description,
                seo_keywords, contact_email, contact_phone, contact_address,
                social_facebook, social_twitter, social_instagram
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
            ON CONFLICT DO NOTHING
            RETURNING id
        `, [
            'Vote for Change 2026', 'Sarah Johnson', 'Mayor', 'Springfield, IL',
            'https://voteforchange2026.com',
            '#1e3a8a', '#3b82f6', 'active',
            'Sarah Johnson for Mayor - Vote for Change 2026',
            "Join Sarah Johnson's campaign for Mayor of Springfield. Together we can create positive change for our community.",
            'Sarah Johnson, Mayor, Springfield, Illinois, campaign, vote, election 2026',
            'info@voteforchange2026.com', '(555) 123-4567', '123 Campaign St, Springfield, IL 62701',
            'https://facebook.com/sarahjohnson2026', 'https://twitter.com/sarah2026',
            'https://instagram.com/sarahjohnson2026'
        ]);
        if (campaignRes.rows.length > 0) {
            console.log('✅ Sample campaign created with ID:', campaignRes.rows[0].id);
        } else {
            console.log('ℹ️  Sample campaign already exists — skipped.');
        }

        // Create / update admin user
        const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeThisPassword123!';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@blueoceanstrategies.com';

        const adminRes = await pool.query(`
            INSERT INTO admin_users (username, email, password_hash, role, active)
            VALUES ($1,$2,$3,'admin',TRUE)
            ON CONFLICT (username) DO UPDATE
                SET password_hash = EXCLUDED.password_hash,
                    email         = EXCLUDED.email
            RETURNING id
        `, [adminUsername, adminEmail, hashedPassword]);
        console.log('✅ Admin user upserted with ID:', adminRes.rows[0].id);
        console.log('📝 Username:', adminUsername);
        console.log('🔑 Password:', adminPassword);

        // Sample contact submissions
        const sampleContacts = [
            {
                first_name: 'John', last_name: 'Smith', email: 'john.smith@email.com',
                phone: '(555) 987-6543', interest: 'volunteering',
                message: 'I would like to volunteer for the campaign. I have experience in phone banking and door-to-door canvassing.',
                newsletter_signup: true, utm_source: 'facebook', utm_medium: 'social', utm_campaign: 'spring2026'
            },
            {
                first_name: 'Maria', last_name: 'Garcia', email: 'maria.garcia@email.com',
                phone: '(555) 456-7890', interest: 'information',
                message: 'Can you provide more information about your stance on education policy?',
                newsletter_signup: true, utm_source: 'google', utm_medium: 'search', utm_campaign: 'education'
            },
            {
                first_name: 'David', last_name: 'Wilson', email: 'david.wilson@email.com',
                phone: null, interest: 'event',
                message: 'When is the next town hall meeting? I would like to attend.',
                newsletter_signup: false, utm_source: 'website', utm_medium: 'direct', utm_campaign: null
            }
        ];

        for (const c of sampleContacts) {
            await pool.query(`
                INSERT INTO contact_submissions (
                    first_name, last_name, email, phone, interest, message,
                    newsletter_signup, utm_source, utm_medium, utm_campaign
                ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
                ON CONFLICT DO NOTHING
            `, [c.first_name, c.last_name, c.email, c.phone, c.interest, c.message,
                c.newsletter_signup, c.utm_source, c.utm_medium, c.utm_campaign]);
        }
        console.log('✅ Sample contact submissions added');

        // Newsletter subscribers
        const subscribers = [
            { email: 'subscriber1@email.com', first_name: 'Alice', last_name: 'Brown' },
            { email: 'subscriber2@email.com', first_name: 'Bob',   last_name: 'Johnson' },
            { email: 'subscriber3@email.com', first_name: 'Carol', last_name: 'Davis' }
        ];
        for (const s of subscribers) {
            await pool.query(`
                INSERT INTO newsletter_subscribers (email, first_name, last_name, source)
                VALUES ($1,$2,$3,'manual')
                ON CONFLICT (email) DO NOTHING
            `, [s.email, s.first_name, s.last_name]);
        }
        console.log('✅ Newsletter subscribers added');

        console.log('\n🎉 Database setup completed successfully!');
        console.log('\n📊 Next steps:');
        console.log('1. Make sure PostgreSQL is running and .env is configured');
        console.log('2. Run "npm start" to launch the server');
        console.log('3. Visit http://localhost:3000 to see your site');
        console.log('4. Visit http://localhost:3000/admin to access the admin panel');
        console.log('\n🔐 Admin Credentials:');
        console.log('   Username:', adminUsername);
        console.log('   Password:', adminPassword);

    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        console.error('   Make sure PostgreSQL is running and the database exists.');
        console.error('   Hint: createdb blue_ocean_strategies');
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

// Run setup if this file is executed directly
if (require.main === module) {
    setupDatabase();
}

module.exports = setupDatabase;