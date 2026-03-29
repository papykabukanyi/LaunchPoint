// Blue Ocean Strategies - Node.js Server
// Full-stack Political Marketing Platform — PostgreSQL Edition

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';

// Enhanced Middleware Setup
app.use(helmet({
    contentSecurityPolicy: false, // Allow inline styles and scripts for development
    crossOriginEmbedderPolicy: false
}));

app.use(compression());
app.use(morgan('combined'));
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Form submission rate limiting
const formLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // limit form submissions
    message: 'Too many form submissions, please try again later.',
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// File upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images and documents are allowed'));
        }
    }
});

// PostgreSQL connection pool
const pool = new Pool(
    process.env.DATABASE_URL
        ? { connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false }
        : {
            host: process.env.PGHOST || 'localhost',
            port: parseInt(process.env.PGPORT || '5432'),
            database: process.env.PGDATABASE || 'blue_ocean_strategies',
            user: process.env.PGUSER || 'postgres',
            password: process.env.PGPASSWORD || ''
        }
);

pool.connect().then(client => {
    console.log('Connected to PostgreSQL database.');
    client.release();
    initializeDatabase();
}).catch(err => {
    console.error('PostgreSQL connection error:', err.message);
    console.error('Make sure PostgreSQL is running and .env credentials are correct.');
});

// Initialize Database Tables (PostgreSQL)
async function initializeDatabase() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS contact_submissions (
                id          SERIAL PRIMARY KEY,
                first_name  TEXT NOT NULL,
                last_name   TEXT NOT NULL,
                email       TEXT NOT NULL,
                phone       TEXT,
                interest    TEXT,
                message     TEXT NOT NULL,
                newsletter_signup BOOLEAN DEFAULT FALSE,
                ip_address  TEXT,
                user_agent  TEXT,
                submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                processed   BOOLEAN DEFAULT FALSE,
                campaign_id INTEGER,
                referrer    TEXT,
                utm_source  TEXT,
                utm_medium  TEXT,
                utm_campaign TEXT,
                status      TEXT DEFAULT 'new',
                assigned_to TEXT
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS campaigns (
                id              SERIAL PRIMARY KEY,
                campaign_name   TEXT NOT NULL,
                candidate_name  TEXT NOT NULL,
                office          TEXT,
                location        TEXT,
                website_url     TEXT,
                primary_color   TEXT DEFAULT '#1e3a8a',
                secondary_color TEXT DEFAULT '#3b82f6',
                logo_url        TEXT,
                status          TEXT DEFAULT 'active',
                created_date    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                seo_title       TEXT,
                seo_description TEXT,
                seo_keywords    TEXT,
                analytics_id    TEXT,
                social_facebook TEXT,
                social_twitter  TEXT,
                social_instagram TEXT,
                contact_email   TEXT,
                contact_phone   TEXT,
                contact_address TEXT
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS newsletter_subscribers (
                id                SERIAL PRIMARY KEY,
                email             TEXT UNIQUE NOT NULL,
                first_name        TEXT,
                last_name         TEXT,
                subscription_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                active            BOOLEAN DEFAULT TRUE,
                campaign_id       INTEGER,
                source            TEXT DEFAULT 'website'
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS analytics_events (
                id           SERIAL PRIMARY KEY,
                event_type   TEXT NOT NULL,
                page_url     TEXT,
                user_ip      TEXT,
                user_agent   TEXT,
                referrer     TEXT,
                utm_source   TEXT,
                utm_medium   TEXT,
                utm_campaign TEXT,
                event_data   JSONB,
                timestamp    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                campaign_id  INTEGER
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS admin_users (
                id            SERIAL PRIMARY KEY,
                username      TEXT UNIQUE NOT NULL,
                email         TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role          TEXT DEFAULT 'admin',
                created_date  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                last_login    TIMESTAMP WITH TIME ZONE,
                active        BOOLEAN DEFAULT TRUE
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS lead_notes (
                id         SERIAL PRIMARY KEY,
                lead_id    INTEGER NOT NULL REFERENCES contact_submissions(id) ON DELETE CASCADE,
                note       TEXT NOT NULL,
                created_by TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS lead_activities (
                id          SERIAL PRIMARY KEY,
                lead_id     INTEGER NOT NULL REFERENCES contact_submissions(id) ON DELETE CASCADE,
                action_type TEXT NOT NULL,
                details     TEXT,
                created_by  TEXT,
                created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);

        console.log('Database tables initialized.');
    } catch (err) {
        console.error('Error initializing database tables:', err.message);
    } finally {
        client.release();
    }
}

// Email Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail', // Configure based on your email provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Middleware to log analytics events
const logAnalytics = (eventType) => {
    return (req, res, next) => {
        pool.query(
            `INSERT INTO analytics_events
             (event_type, page_url, user_ip, user_agent, referrer, utm_source, utm_medium, utm_campaign, event_data, campaign_id)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [eventType, req.originalUrl, req.ip, req.get('User-Agent'), req.get('Referrer'),
             req.query.utm_source || null, req.query.utm_medium || null, req.query.utm_campaign || null,
             JSON.stringify(req.body || {}), req.query.campaign_id || null]
        ).catch(err => console.error('Analytics logging error:', err));
        next();
    };
};

// Authentication middleware
const authenticateAdmin = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

// Routes

// Serve main pages
app.get('/', logAnalytics('page_view'), (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/about', logAnalytics('page_view'), (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/platform', logAnalytics('page_view'), (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'platform.html'));
});

app.get('/contact', logAnalytics('page_view'), (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/events', logAnalytics('page_view'), (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'events.html'));
});

app.get('/volunteer', logAnalytics('page_view'), (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'volunteer.html'));
});

app.get('/donate', logAnalytics('page_view'), (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'donate.html'));
});

// Admin panel
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API Routes

// Contact form submission
app.post('/api/contact', 
    formLimiter,
    logAnalytics('form_submission'),
    [
        body('firstName').trim().isLength({ min: 2 }).matches(/^[a-zA-Z\s-']+$/),
        body('lastName').trim().isLength({ min: 2 }).matches(/^[a-zA-Z\s-']+$/),
        body('email').isEmail().normalizeEmail(),
        body('phone').optional().isMobilePhone(),
        body('message').trim().isLength({ min: 10, max: 1000 }),
        body('interest').optional().isIn(['volunteering', 'donating', 'event', 'information', 'other'])
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ 
                    success: false, 
                    errors: errors.array() 
                });
            }

            const {
                firstName,
                lastName,
                email,
                phone,
                interest,
                message,
                newsletter,
                campaignId
            } = req.body;

            // Insert contact submission
            await pool.query(
                `INSERT INTO contact_submissions
                 (first_name, last_name, email, phone, interest, message,
                  newsletter_signup, ip_address, user_agent, campaign_id,
                  referrer, utm_source, utm_medium, utm_campaign)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
                [firstName, lastName, email, phone || null, interest || null, message,
                 newsletter ? true : false, req.ip, req.get('User-Agent'),
                 campaignId || null, req.get('Referrer'),
                 req.query.utm_source || null, req.query.utm_medium || null, req.query.utm_campaign || null]
            );

            console.log('New contact submission from:', email);

            // Add to newsletter if requested
            if (newsletter) {
                await pool.query(
                    `INSERT INTO newsletter_subscribers (email, first_name, last_name, campaign_id, source)
                     VALUES ($1,$2,$3,$4,$5) ON CONFLICT (email) DO NOTHING`,
                    [email, firstName, lastName, campaignId || null, 'contact_form']
                );
            }

            // Send email notification if configured
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER,
                    subject: `New Contact Form Submission - ${firstName} ${lastName}`,
                    html: `
                        <h2>New Contact Form Submission</h2>
                        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                        <p><strong>Interest:</strong> ${interest || 'Not specified'}</p>
                        <p><strong>Message:</strong></p>
                        <p>${message}</p>
                        <p><strong>Newsletter Signup:</strong> ${newsletter ? 'Yes' : 'No'}</p>
                        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                    `
                };

                try {
                    await transporter.sendMail(mailOptions);
                    console.log('Notification email sent');
                } catch (emailError) {
                    console.error('Email sending error:', emailError);
                }
            }

            res.json({ 
                success: true, 
                message: 'Your message has been sent successfully!' 
            });

        } catch (error) {
            console.error('Contact form error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'An error occurred while processing your request' 
            });
        }
    }
);

// Newsletter subscription
app.post('/api/newsletter', 
    formLimiter,
    [body('email').isEmail().normalizeEmail()],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        const { email, firstName, lastName, campaignId } = req.body;
        
        await pool.query(
            `INSERT INTO newsletter_subscribers (email, first_name, last_name, campaign_id, source)
             VALUES ($1,$2,$3,$4,$5) ON CONFLICT (email) DO NOTHING`,
            [email, firstName || null, lastName || null, campaignId || null, 'newsletter']
        );

        res.json({ 
            success: true, 
            message: 'Successfully subscribed to newsletter!' 
        });
    }
);

// Get campaign data for dynamic content
app.get('/api/campaign/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM campaigns WHERE id = $1 AND status = 'active'`,
            [req.params.id]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'Campaign not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Admin authentication
app.post('/api/admin/login', 
    [
        body('username').trim().notEmpty(),
        body('password').notEmpty()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { username, password } = req.body;

            const result = await pool.query(
                `SELECT * FROM admin_users WHERE username = $1 AND active = TRUE`,
                [username]
            );
            const user = result.rows[0];

            if (!user) return res.status(401).json({ error: 'Invalid credentials' });

            const validPassword = await bcrypt.compare(password, user.password_hash);
            if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

            const token = jwt.sign(
                { id: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            await pool.query(`UPDATE admin_users SET last_login = NOW() WHERE id = $1`, [user.id]);

            res.json({ 
                success: true, 
                token,
                user: { id: user.id, username: user.username, email: user.email }
            });
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// Admin dashboard data
app.get('/api/admin/dashboard', authenticateAdmin, async (req, res) => {
    try {
        const [tot, tod, sub, rec] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM contact_submissions'),
            pool.query("SELECT COUNT(*) FROM contact_submissions WHERE submission_date::date = CURRENT_DATE"),
            pool.query('SELECT COUNT(*) FROM newsletter_subscribers WHERE active = TRUE'),
            pool.query(`SELECT first_name, last_name, email, submission_date, interest
                        FROM contact_submissions ORDER BY submission_date DESC LIMIT 10`)
        ]);
        res.json({
            stats: {
                totalContacts: parseInt(tot.rows[0].count),
                todayContacts: parseInt(tod.rows[0].count),
                newsletterSubscribers: parseInt(sub.rows[0].count)
            },
            recentSubmissions: rec.rows
        });
    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
        success: true,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`
    });
});

// Export contact data (Admin only)
app.get('/api/admin/export/contacts', authenticateAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT first_name, last_name, email, phone, interest, message,
                    newsletter_signup, status, submission_date, utm_source, utm_medium, utm_campaign
             FROM contact_submissions ORDER BY submission_date DESC`
        );

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=blue-ocean-leads.csv');

        const headers = ['First Name','Last Name','Email','Phone','Interest','Message','Newsletter','Status','Date','UTM Source','UTM Medium','UTM Campaign'];
        let csv = headers.join(',') + '\n';

        result.rows.forEach(row => {
            csv += [
                `"${row.first_name}"`, `"${row.last_name}"`, `"${row.email}"`, `"${row.phone || ''}"`,
                `"${row.interest || ''}"`, `"${(row.message || '').replace(/"/g, '""')}"`,
                row.newsletter_signup ? 'Yes' : 'No', `"${row.status || 'new'}"`,
                `"${row.submission_date}"`, `"${row.utm_source || ''}"`,
                `"${row.utm_medium || ''}"`, `"${row.utm_campaign || ''}"`
            ].join(',') + '\n';
        });

        res.send(csv);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// =============================================
// LEAD MANAGEMENT API (Full CRUD + Communications)
// =============================================

// GET /api/admin/leads - paginated, filtered, searchable list
app.get('/api/admin/leads', authenticateAdmin, async (req, res) => {
    const { page = 1, limit = 25, search = '', status = '', interest = '', sort = 'submission_date', order = 'DESC' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const allowedSorts = ['submission_date', 'first_name', 'last_name', 'email', 'status', 'interest'];
    const safeSort = allowedSorts.includes(sort) ? sort : 'submission_date';
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const conditions = [];
    const params = [];
    let p = 1;

    if (search) {
        conditions.push(`(first_name ILIKE $${p} OR last_name ILIKE $${p} OR email ILIKE $${p} OR phone ILIKE $${p})`);
        params.push(`%${search}%`);
        p++;
    }
    if (status) {
        conditions.push(`(status = $${p} OR (status IS NULL AND $${p} = 'new'))`);
        params.push(status, status);
        p += 2;
    }
    if (interest) {
        conditions.push(`interest = $${p}`);
        params.push(interest);
        p++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    try {
        const countRes = await pool.query(`SELECT COUNT(*) FROM contact_submissions ${where}`, params);
        const total = parseInt(countRes.rows[0].count);

        const leadsRes = await pool.query(
            `SELECT id, first_name, last_name, email, phone, interest, status, submission_date, utm_source, utm_medium, processed
             FROM contact_submissions ${where}
             ORDER BY ${safeSort} ${safeOrder}
             LIMIT $${p} OFFSET $${p + 1}`,
            [...params, parseInt(limit), offset]
        );

        res.json({
            leads: leadsRes.rows.map(r => ({ ...r, status: r.status || 'new' })),
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
        });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// GET /api/admin/leads/:id - single lead with notes and activity
app.get('/api/admin/leads/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;

    db.get(`SELECT * FROM contact_submissions WHERE id = ?`, [id], (err, lead) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!lead) return res.status(404).json({ error: 'Lead not found' });

        lead.status = lead.status || 'new';

        db.all(`SELECT * FROM lead_notes WHERE lead_id = ? ORDER BY created_at DESC`, [id], (err, notes) => {
            db.all(`SELECT * FROM lead_activities WHERE lead_id = ? ORDER BY created_at DESC LIMIT 50`, [id], (err2, activities) => {
                res.json({ lead, notes: notes || [], activities: activities || [] });
            });
        });
    });
});

// PUT /api/admin/leads/:id - update lead information
app.put('/api/admin/leads/:id', authenticateAdmin, [
    body('email').isEmail().normalizeEmail(),
    body('first_name').trim().isLength({ min: 1 }),
    body('last_name').trim().isLength({ min: 1 })
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { first_name, last_name, email, phone, interest, message, status, assigned_to } = req.body;

    db.run(
        `UPDATE contact_submissions SET first_name=?, last_name=?, email=?, phone=?, interest=?, message=?, status=?, assigned_to=?, processed=1 WHERE id=?`,
        [first_name, last_name, email, phone || null, interest || null, message, status || 'new', assigned_to || null, id],
        function(err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (this.changes === 0) return res.status(404).json({ error: 'Lead not found' });

            db.run(`INSERT INTO lead_activities (lead_id, action_type, details, created_by) VALUES (?,?,?,?)`,
                [id, 'updated', 'Lead information updated', req.user.username]);

            res.json({ success: true, message: 'Lead updated successfully' });
        }
    );
});

// PATCH /api/admin/leads/:id/status - quick status update
app.patch('/api/admin/leads/:id/status', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['new', 'contacted', 'qualified', 'proposal_sent', 'converted', 'not_interested'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    db.run(`UPDATE contact_submissions SET status=? WHERE id=?`, [status, id], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (this.changes === 0) return res.status(404).json({ error: 'Lead not found' });

        db.run(`INSERT INTO lead_activities (lead_id, action_type, details, created_by) VALUES (?,?,?,?)`,
            [id, 'status_changed', `Status changed to: ${status}`, req.user.username]);

        res.json({ success: true });
    });
});

// DELETE /api/admin/leads/:id - delete lead and all related data
app.delete('/api/admin/leads/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;

    db.run(`DELETE FROM lead_notes WHERE lead_id = ?`, [id]);
    db.run(`DELETE FROM lead_activities WHERE lead_id = ?`, [id]);
    db.run(`DELETE FROM contact_submissions WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (this.changes === 0) return res.status(404).json({ error: 'Lead not found' });
        res.json({ success: true, message: 'Lead deleted successfully' });
    });
});

// POST /api/admin/leads/:id/email - send email to a lead
app.post('/api/admin/leads/:id/email', authenticateAdmin, [
    body('subject').trim().isLength({ min: 1, max: 200 }),
    body('body').trim().isLength({ min: 1 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { subject, body: emailBody } = req.body;

    db.get(`SELECT * FROM contact_submissions WHERE id = ?`, [id], async (err, lead) => {
        if (err || !lead) return res.status(404).json({ error: 'Lead not found' });

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            return res.status(503).json({ error: 'Email service not configured. Add EMAIL_USER and EMAIL_PASS to your .env file.' });
        }

        try {
            await transporter.sendMail({
                from: `Blue Ocean Strategies <${process.env.EMAIL_USER}>`,
                to: `${lead.first_name} ${lead.last_name} <${lead.email}>`,
                subject,
                html: emailBody
            });

            db.run(`INSERT INTO lead_activities (lead_id, action_type, details, created_by) VALUES (?,?,?,?)`,
                [id, 'email_sent', `Email sent — Subject: ${subject}`, req.user.username]);

            res.json({ success: true, message: `Email sent to ${lead.email}` });
        } catch (error) {
            console.error('Email error:', error);
            res.status(500).json({ error: `Failed to send email: ${error.message}` });
        }
    });
});

// POST /api/admin/leads/:id/sms - send SMS via Twilio
app.post('/api/admin/leads/:id/sms', authenticateAdmin, [
    body('message').trim().isLength({ min: 1, max: 1600 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { message: smsBody } = req.body;

    db.get(`SELECT * FROM contact_submissions WHERE id = ?`, [id], async (err, lead) => {
        if (err || !lead) return res.status(404).json({ error: 'Lead not found' });
        if (!lead.phone) return res.status(400).json({ error: 'This lead has no phone number on file.' });

        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE) {
            return res.status(503).json({ error: 'Twilio SMS service not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE to your .env file.' });
        }

        try {
            // Dynamically require twilio only when needed
            const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            await twilio.messages.create({
                body: smsBody,
                from: process.env.TWILIO_PHONE,
                to: lead.phone
            });

            db.run(`INSERT INTO lead_activities (lead_id, action_type, details, created_by) VALUES (?,?,?,?)`,
                [id, 'sms_sent', `SMS sent: "${smsBody.substring(0, 80)}${smsBody.length > 80 ? '...' : ''}"`, req.user.username]);

            res.json({ success: true, message: `SMS sent to ${lead.phone}` });
        } catch (error) {
            console.error('SMS error:', error);
            res.status(500).json({ error: `Failed to send SMS: ${error.message}` });
        }
    });
});

// POST /api/admin/leads/:id/notes - add a note to a lead
app.post('/api/admin/leads/:id/notes', authenticateAdmin, [
    body('note').trim().isLength({ min: 1, max: 2000 })
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { note } = req.body;

    db.run(`INSERT INTO lead_notes (lead_id, note, created_by) VALUES (?,?,?)`,
        [id, note, req.user.username],
        function(err) {
            if (err) return res.status(500).json({ error: 'Database error' });

            db.run(`INSERT INTO lead_activities (lead_id, action_type, details, created_by) VALUES (?,?,?,?)`,
                [id, 'note_added', 'Note added to lead', req.user.username]);

            res.json({ success: true, id: this.lastID, message: 'Note added successfully' });
        }
    );
});

// DELETE /api/admin/leads/:id/notes/:noteId - delete a note
app.delete('/api/admin/leads/:id/notes/:noteId', authenticateAdmin, (req, res) => {
    const { noteId } = req.params;
    db.run(`DELETE FROM lead_notes WHERE id = ?`, [noteId], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ success: true });
    });
});

// GET /api/admin/stats - comprehensive dashboard stats
app.get('/api/admin/stats', authenticateAdmin, (req, res) => {
    const queries = [
        new Promise((resolve, reject) => db.get(`SELECT COUNT(*) as c FROM contact_submissions`, [], (e,r) => e ? reject(e) : resolve(r.c))),
        new Promise((resolve, reject) => db.get(`SELECT COUNT(*) as c FROM contact_submissions WHERE DATE(submission_date)=DATE('now')`, [], (e,r) => e ? reject(e) : resolve(r.c))),
        new Promise((resolve, reject) => db.get(`SELECT COUNT(*) as c FROM contact_submissions WHERE status='new' OR status IS NULL`, [], (e,r) => e ? reject(e) : resolve(r.c))),
        new Promise((resolve, reject) => db.get(`SELECT COUNT(*) as c FROM contact_submissions WHERE status='contacted'`, [], (e,r) => e ? reject(e) : resolve(r.c))),
        new Promise((resolve, reject) => db.get(`SELECT COUNT(*) as c FROM contact_submissions WHERE status='converted'`, [], (e,r) => e ? reject(e) : resolve(r.c))),
        new Promise((resolve, reject) => db.get(`SELECT COUNT(*) as c FROM newsletter_subscribers WHERE active=1`, [], (e,r) => e ? reject(e) : resolve(r.c))),
        new Promise((resolve, reject) => db.all(
            `SELECT id, first_name, last_name, email, phone, interest, status, submission_date FROM contact_submissions ORDER BY submission_date DESC LIMIT 10`,
            [], (e,r) => e ? reject(e) : resolve(r)
        )),
        new Promise((resolve, reject) => db.all(
            `SELECT status, COUNT(*) as count FROM contact_submissions GROUP BY status`,
            [], (e,r) => e ? reject(e) : resolve(r)
        ))
    ];

    Promise.all(queries)
        .then(([total, today, newLeads, contacted, converted, subscribers, recent, byStatus]) => {
            res.json({
                stats: { total, today, newLeads, contacted, converted, subscribers },
                recentLeads: recent.map(r => ({ ...r, status: r.status || 'new' })),
                byStatus: byStatus.map(r => ({ ...r, status: r.status || 'new' }))
            });
        })
        .catch(err => res.status(500).json({ error: 'Failed to fetch stats' }));
});


// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(error.status || 500).json({
        error: 'An unexpected error occurred',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Database connection closed.');
        process.exit(0);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Blue Ocean Strategies Platform running on port ${PORT}`);
    console.log(`📊 Admin panel available at: http://localhost:${PORT}/admin`);
    console.log(`📧 Contact forms will be stored in database`);
});

module.exports = app;