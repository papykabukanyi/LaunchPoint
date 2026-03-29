// LaunchPoint DM — Node.js Server
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
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3300;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';

// Enhanced Middleware Setup
app.use(helmet({
    contentSecurityPolicy: false, // Allow inline styles and scripts for development
    crossOriginEmbedderPolicy: false
}));

app.use(compression());
app.use(morgan('combined'));
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3300'],
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

// Redirect any .html URLs to clean URLs (e.g. /about.html → /about)
app.use((req, res, next) => {
    if (req.path.endsWith('.html')) {
        const clean = req.path.slice(0, -5) || '/';
        const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
        return res.redirect(301, clean + qs);
    }
    next();
});

app.use(express.static('public'));

// Serve Vue SPA build output (dist/) — assets served at root so /assets/... paths resolve
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
}

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
            CREATE TABLE IF NOT EXISTS newsletters_sent (
                id            SERIAL PRIMARY KEY,
                subject       TEXT NOT NULL,
                body_html     TEXT NOT NULL,
                sent_by       TEXT NOT NULL,
                recipient_count INTEGER DEFAULT 0,
                status        TEXT DEFAULT 'sent',
                sent_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

        await client.query(`
            CREATE TABLE IF NOT EXISTS website_sources (
                id           SERIAL PRIMARY KEY,
                name         TEXT NOT NULL,
                domain       TEXT,
                api_key      TEXT UNIQUE NOT NULL,
                color        TEXT DEFAULT '#3498db',
                active       BOOLEAN DEFAULT TRUE,
                description  TEXT,
                created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);

        // Add source columns to existing tables if they don't exist
        await client.query(`ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS source_website TEXT`);
        await client.query(`ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS source_website_id INTEGER`);
        await client.query(`ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS source_website TEXT`);
        await client.query(`ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS source_website_id INTEGER`);

        // Service needs + deal estimate columns
        await client.query(`ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS service_needs JSONB DEFAULT '{}'`);
        await client.query(`ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS budget_estimate NUMERIC(10,2) DEFAULT 0`);
        await client.query(`ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS budget_tier TEXT DEFAULT 'N/A'`);
        await client.query(`ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS estimate_breakdown JSONB DEFAULT '{}'`);

        // Admin registration requests
        await client.query(`
            CREATE TABLE IF NOT EXISTS admin_registrations (
                id               SERIAL PRIMARY KEY,
                full_name        TEXT NOT NULL,
                email            TEXT NOT NULL,
                organization     TEXT,
                reason           TEXT,
                status           TEXT DEFAULT 'pending',
                reviewed_by      TEXT,
                reviewed_at      TIMESTAMP WITH TIME ZONE,
                rejection_reason TEXT,
                created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);

        // Ensure role column exists for installations that predate the column
        await client.query(`ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin'`);
        await client.query(`UPDATE admin_users SET role = 'admin' WHERE role IS NULL`);

        // Seed the superadmin account from .env (idempotent)
        const superUser = process.env.SUPERADMIN_USERNAME || 'superadmin';
        const superEmail = process.env.SUPERADMIN_EMAIL || 'hello@launchpoint-dm.com';
        const superPass = process.env.SUPERADMIN_PASSWORD || 'superadmin';
        const superHash = await bcrypt.hash(superPass, 10);
        await client.query(`
            INSERT INTO admin_users (username, email, password_hash, role, active)
            VALUES ($1, $2, $3, 'superadmin', TRUE)
            ON CONFLICT (username) DO NOTHING
        `, [superUser, superEmail, superHash]);

        console.log('Database tables initialized.');
    } catch (err) {
        console.error('Error initializing database tables:', err.message);
    } finally {
        client.release();
    }
}

// Email Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// SMS Configuration (Vonage)
let vonage = null;
if (process.env.VONAGE_API_KEY && process.env.VONAGE_API_SECRET) {
    try {
        const { Vonage } = require('@vonage/server-sdk');
        vonage = new Vonage({
            apiKey: process.env.VONAGE_API_KEY,
            apiSecret: process.env.VONAGE_API_SECRET
        });
        console.log('Vonage SMS ready.');
    } catch (e) {
        console.warn('Vonage SDK not available:', e.message);
    }
}

async function sendSmsAlert(text) {
    if (!vonage || !process.env.VONAGE_TO_NUMBER) return;
    try {
        await vonage.sms.send({
            to:   process.env.VONAGE_TO_NUMBER,
            from: process.env.VONAGE_FROM || 'LaunchPoint',
            text
        });
    } catch (err) {
        console.error('Vonage SMS error:', err.message);
    }
}

// API key authentication for external website sources
async function authenticateApiKey(key) {
    if (!key) return null;
    try {
        const result = await pool.query(
            'SELECT * FROM website_sources WHERE api_key = $1 AND active = TRUE',
            [key]
        );
        return result.rows[0] || null;
    } catch (err) {
        return null;
    }
}

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

// Superadmin-only middleware
const authenticateSuperAdmin = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access denied.' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'superadmin') return res.status(403).json({ error: 'Super admin access required.' });
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

// =============================================
// EXTERNAL API — Accept form submissions from other websites
// Authenticated by X-API-Key header matching a registered website_source
// =============================================

// Allow any origin for external endpoints (CORS is validated by API key + domain check)
const externalCors = cors({ origin: '*' });

// POST /api/external/contact — submit a contact form from an external website
app.post('/api/external/contact',
    externalCors,
    formLimiter,
    [
        body('email').isEmail().normalizeEmail(),
        body('message').trim().isLength({ min: 2, max: 2000 }),
        body('firstName').optional().trim(),
        body('lastName').optional().trim(),
        body('name').optional().trim(),
        body('phone').optional().isMobilePhone()
    ],
    async (req, res) => {
        const apiKey = req.headers['x-api-key'] || req.body.apiKey;
        const source = await authenticateApiKey(apiKey);
        if (!source) {
            return res.status(401).json({ success: false, error: 'Invalid or missing API key.' });
        }

        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ success: false, errors: validationErrors.array() });
        }

        try {
            const {
                email, message, phone, interest, newsletter,
                firstName, lastName, name
            } = req.body;

            // Support both firstName/lastName and a single name field
            let fName = firstName || '';
            let lName = lastName || '';
            if (!fName && name) {
                const parts = String(name).trim().split(' ');
                fName = parts[0] || '';
                lName = parts.slice(1).join(' ') || '';
            }
            if (!fName) fName = 'Unknown';
            if (!lName) lName = '-';

            await pool.query(
                `INSERT INTO contact_submissions
                 (first_name, last_name, email, phone, interest, message,
                  newsletter_signup, ip_address, user_agent, referrer,
                  utm_source, source_website, source_website_id, status)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'new')`,
                [fName, lName, email, phone || null, interest || null,
                 message, newsletter ? true : false, req.ip,
                 req.get('User-Agent'), req.get('Origin') || req.get('Referer'),
                 source.name, source.name, source.id]
            );

            if (newsletter) {
                await pool.query(
                    `INSERT INTO newsletter_subscribers
                     (email, first_name, last_name, source, source_website, source_website_id)
                     VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (email) DO NOTHING`,
                    [email, fName, lName, source.name, source.name, source.id]
                );
            }

            // Update source lead count
            await pool.query(
                `UPDATE website_sources SET created_date = created_date WHERE id = $1`,
                [source.id]
            );

            res.json({ success: true, message: 'Form submitted successfully.' });
        } catch (err) {
            console.error('External contact error:', err);
            res.status(500).json({ success: false, error: 'Failed to process submission.' });
        }
    }
);

// OPTIONS preflight for external contact
app.options('/api/external/contact', externalCors);

// POST /api/external/newsletter — newsletter signup from external website
app.post('/api/external/newsletter',
    externalCors,
    formLimiter,
    [body('email').isEmail().normalizeEmail()],
    async (req, res) => {
        const apiKey = req.headers['x-api-key'] || req.body.apiKey;
        const source = await authenticateApiKey(apiKey);
        if (!source) {
            return res.status(401).json({ success: false, error: 'Invalid or missing API key.' });
        }

        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ success: false, errors: validationErrors.array() });
        }

        const { email, firstName, lastName } = req.body;
        try {
            await pool.query(
                `INSERT INTO newsletter_subscribers
                 (email, first_name, last_name, source, source_website, source_website_id)
                 VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (email) DO NOTHING`,
                [email, firstName || null, lastName || null, source.name, source.name, source.id]
            );
            res.json({ success: true, message: 'Subscribed successfully.' });
        } catch (err) {
            console.error('External newsletter error:', err);
            res.status(500).json({ success: false, error: 'Subscription failed.' });
        }
    }
);

// OPTIONS preflight for external newsletter
app.options('/api/external/newsletter', externalCors);

// =============================================
// ADMIN — Website Sources CRUD
// =============================================

// GET /api/admin/sources
app.get('/api/admin/sources', authenticateAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT ws.*,
                   (SELECT COUNT(*) FROM contact_submissions cs WHERE cs.source_website_id = ws.id) AS lead_count
            FROM website_sources ws
            ORDER BY ws.created_date DESC
        `);
        res.json({ sources: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// POST /api/admin/sources — register a new external website
app.post('/api/admin/sources', authenticateAdmin, [
    body('name').trim().isLength({ min: 2, max: 100 }),
    body('domain').optional().trim(),
    body('color').optional().matches(/^#[0-9A-Fa-f]{3,6}$/),
    body('description').optional().trim().isLength({ max: 300 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, domain, color, description } = req.body;
    const rawKey = 'bos_' + crypto.randomBytes(28).toString('hex');

    try {
        const result = await pool.query(
            `INSERT INTO website_sources (name, domain, api_key, color, description)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name, domain || null, rawKey, color || '#3498db', description || null]
        );
        // Return the raw key only on creation
        res.json({ success: true, source: result.rows[0], apiKey: rawKey });
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ error: 'A source with this name already exists.' });
        res.status(500).json({ error: 'Database error' });
    }
});

// PUT /api/admin/sources/:id — update source metadata (not key)
app.put('/api/admin/sources/:id', authenticateAdmin, [
    body('name').trim().isLength({ min: 2, max: 100 }),
    body('domain').optional().trim(),
    body('color').optional().matches(/^#[0-9A-Fa-f]{3,6}$/),
    body('active').optional().isBoolean()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, domain, color, description, active } = req.body;
    try {
        const result = await pool.query(
            `UPDATE website_sources SET name=$1, domain=$2, color=$3, description=$4, active=$5 WHERE id=$6 RETURNING *`,
            [name, domain || null, color || '#3498db', description || null, active !== false, req.params.id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Source not found' });
        res.json({ success: true, source: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// DELETE /api/admin/sources/:id
app.delete('/api/admin/sources/:id', authenticateAdmin, async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM website_sources WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Source not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// POST /api/admin/sources/:id/regenerate-key
app.post('/api/admin/sources/:id/regenerate-key', authenticateAdmin, async (req, res) => {
    const rawKey = 'bos_' + crypto.randomBytes(28).toString('hex');
    try {
        const result = await pool.query(
            'UPDATE website_sources SET api_key=$1 WHERE id=$2 RETURNING *',
            [rawKey, req.params.id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Source not found' });
        res.json({ success: true, apiKey: rawKey });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Routes

// ---- SPA helpers ----
const distIndex = path.join(__dirname, 'dist', 'index.html');
const publicHtml = (file) => path.join(__dirname, 'public', file);
// All public pages are now served via the Vue SPA (dist/index.html)
function serveSpa() {
    return (req, res) => {
        if (fs.existsSync(distIndex)) return res.sendFile(distIndex);
        res.status(503).send('Site is being built. Please run: npm run build');
    };
}

// Serve public pages — all route to Vue SPA
app.get('/',        logAnalytics('page_view'), serveSpa());
app.get('/about',   logAnalytics('page_view'), serveSpa());
app.get('/contact', logAnalytics('page_view'), serveSpa());

// Admin panel (always served from public/ — not part of Vue SPA)
app.get('/admin', (req, res) => {
    res.sendFile(publicHtml('admin.html'));
});

// =============================================
// DEAL ESTIMATE PRICING ENGINE
// All prices are monthly retainer or one-time fees as noted.
// =============================================

const SERVICE_PRICING = {
    // ── Web & App Development ────────────────────────────────
    website_new:            { label: 'New Website Build',               type: 'one_time', base: 4500  },
    website_update:         { label: 'Website Redesign / Updates',      type: 'one_time', base: 2200  },
    website_maintenance:    { label: 'Website Maintenance',             type: 'monthly',  base: 400   },
    landing_pages:          { label: 'Landing Pages',                   type: 'one_time', base: 900   },
    web_app:                { label: 'Custom Web Application',          type: 'one_time', base: 9500  },
    ecommerce:              { label: 'E-Commerce Development',          type: 'one_time', base: 6500  },
    mobile_app:             { label: 'Mobile App (iOS/Android)',        type: 'one_time', base: 12000 },
    api_backend:            { label: 'API / Backend Development',       type: 'one_time', base: 5500  },
    cms_integration:        { label: 'CMS Integration',                 type: 'one_time', base: 2000  },

    // ── Brand & Design ───────────────────────────────────────
    logo_design:            { label: 'Logo Design',                     type: 'one_time', base: 1500  },
    brand_style_guide:      { label: 'Brand Style Guide',               type: 'one_time', base: 800   },
    ui_ux_design:           { label: 'UI/UX Design & Prototyping',      type: 'one_time', base: 3500  },
    print_materials:        { label: 'Print Materials',                  type: 'one_time', base: 1200  },
    brand_templates:        { label: 'Brand Template Pack',             type: 'one_time', base: 950   },

    // ── SEO & Content ────────────────────────────────────────
    seo:                    { label: 'SEO Optimization',                type: 'monthly',  base: 700   },
    content_creation:       { label: 'Content Creation',                type: 'monthly',  base: 900   },
    blog_management:        { label: 'Blog / Article Management',       type: 'monthly',  base: 600   },

    // ── Social Media ─────────────────────────────────────────
    social_management:      { label: 'Social Media Management',         type: 'monthly',  base: 1200  },
    social_ads:             { label: 'Social Media Advertising',        type: 'monthly',  base: 1500  },
    influencer_outreach:    { label: 'Influencer Outreach',             type: 'monthly',  base: 800   },
    community_management:   { label: 'Community Management',            type: 'monthly',  base: 700   },

    // ── Paid Digital Advertising ─────────────────────────────
    google_ads:             { label: 'Google Ads Management',           type: 'monthly',  base: 1200  },
    programmatic_ads:       { label: 'Programmatic Advertising',        type: 'monthly',  base: 2000  },
    video_ads:              { label: 'Video Ad Production',             type: 'one_time', base: 3500  },
    youtube_ads:            { label: 'YouTube Ad Campaigns',            type: 'monthly',  base: 1000  },
    ott_ctv:                { label: 'OTT / Streaming TV Ads',         type: 'monthly',  base: 2500  },

    // ── Email & SMS ──────────────────────────────────────────
    email_marketing:        { label: 'Email Marketing',                 type: 'monthly',  base: 600   },
    sms_campaigns:          { label: 'SMS Campaign Blasts',             type: 'monthly',  base: 500   },
    crm_setup:              { label: 'CRM Setup & Integration',         type: 'one_time', base: 1800  },
    marketing_automation:   { label: 'Marketing Automation Setup',      type: 'one_time', base: 2200  },

    // ── Analytics & Data ─────────────────────────────────────
    analytics_setup:        { label: 'Analytics & Reporting',           type: 'monthly',  base: 500   },
    custom_dashboard:       { label: 'Custom BI Dashboard',             type: 'one_time', base: 2000  },
    cro_sprint:             { label: 'CRO A/B Testing Sprint',          type: 'one_time', base: 1500  },
    voter_analytics:        { label: 'Voter Data Analytics',            type: 'monthly',  base: 2500  },

    // ── PR & Communications ──────────────────────────────────
    pr_media_relations:     { label: 'PR & Media Relations',            type: 'monthly',  base: 2500  },
    press_releases:         { label: 'Press Release Writing',           type: 'one_time', base: 600   },
    crisis_comms:           { label: 'Crisis Communications',           type: 'monthly',  base: 3000  },
    strategy_consulting:    { label: 'Strategy Consulting',             type: 'monthly',  base: 2000  },

    // ── Political & Advocacy (all industries) ────────────────
    gotv_campaigns:         { label: 'GOTV Email & SMS Campaigns',      type: 'monthly',  base: 1500  },
    voter_outreach:         { label: 'Voter Outreach & Targeting',      type: 'monthly',  base: 2000  },
    political_ads:          { label: 'Political Digital Advertising',   type: 'monthly',  base: 3000  },
    candidate_website:      { label: 'Candidate Website Build',         type: 'one_time', base: 5500  },
    fundraising:            { label: 'Fundraising Strategy & Setup',    type: 'monthly',  base: 2000  },
    campaign_management:    { label: 'Full Campaign Management',        type: 'monthly',  base: 5000  },
    pac_advocacy:           { label: 'PAC / Advocacy Digital Program',  type: 'monthly',  base: 3500  },
    fec_compliance:         { label: 'FEC Compliance & Reporting',      type: 'monthly',  base: 1200  },

    // ── Staffing & Operations ────────────────────────────────
    marketing_recruitment:  { label: 'Marketing Recruitment',           type: 'one_time', base: 2000  },
    workforce_recruitment:  { label: 'Workforce Recruitment',           type: 'one_time', base: 2500  },
    volunteer_management:   { label: 'Volunteer Management',            type: 'monthly',  base: 800   },
    field_operations:       { label: 'Field Operations',                type: 'monthly',  base: 3500  },
    event_management:       { label: 'Event Management',                type: 'monthly',  base: 1500  }
};

// Multipliers
const SCALE_MULTIPLIER  = { local: 1, state: 1.6, federal: 2.4 };
const URGENCY_MULTIPLIER = { standard: 1, fast: 1.25, rush: 1.5 };
const BUDGET_TIERS = [
    { max: 2000,   label: 'Starter',    tag: '🌱' },
    { max: 6000,   label: 'Growth',     tag: '🚀' },
    { max: 15000,  label: 'Pro',        tag: '⭐' },
    { max: 35000,  label: 'Enterprise', tag: '💼' },
    { max: Infinity, label: 'Strategic', tag: '🏆' }
];

function calculateEstimate(serviceNeeds) {
    const {
        services = [],
        race_scale = 'local',
        timeline = 'standard',
        contract_months = 3
    } = serviceNeeds;

    const scaleMult   = SCALE_MULTIPLIER[race_scale]   || 1;
    const urgencyMult = URGENCY_MULTIPLIER[timeline]   || 1;
    const months      = Math.max(1, parseInt(contract_months) || 3);

    let oneTimeTotal  = 0;
    let monthlyTotal  = 0;
    const lineItems   = [];

    services.forEach(key => {
        const svc = SERVICE_PRICING[key];
        if (!svc) return;
        const price = Math.round(svc.base * scaleMult * urgencyMult);
        lineItems.push({ key, label: svc.label, type: svc.type, price });
        if (svc.type === 'monthly') monthlyTotal += price;
        else oneTimeTotal += price;
    });

    const total = oneTimeTotal + (monthlyTotal * months);
    const tier  = BUDGET_TIERS.find(t => total <= t.max) || BUDGET_TIERS[BUDGET_TIERS.length - 1];

    return {
        lineItems,
        oneTimeTotal,
        monthlyTotal,
        months,
        total,
        tier: `${tier.tag} ${tier.label}`
    };
}

// API Routes

// Contact form submission
app.post('/api/contact', 
    formLimiter,
    logAnalytics('form_submission'),
    [
        body('firstName').trim().isLength({ min: 2 }).matches(/^[a-zA-Z\s-']+$/),
        body('lastName').trim().isLength({ min: 2 }).matches(/^[a-zA-Z\s-']+$/),
        body('email').isEmail().normalizeEmail(),
        body('phone').optional({ checkFalsy: true }).isMobilePhone(),
        body('message').optional().trim().isLength({ min: 0, max: 2000 }),
        body('interest').optional().isIn(['volunteering', 'donating', 'event', 'information', 'other', 'services'])
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
                campaignId,
                serviceNeeds  // new: object from service questionnaire
            } = req.body;

            // Calculate estimate if service needs provided
            let estimate = { total: 0, tier: 'N/A', lineItems: [], oneTimeTotal: 0, monthlyTotal: 0, months: 1 };
            let svcNeedsJson = '{}';
            let estimateBreakdownJson = '{}';
            if (serviceNeeds && typeof serviceNeeds === 'object') {
                estimate = calculateEstimate(serviceNeeds);
                svcNeedsJson = JSON.stringify(serviceNeeds);
                estimateBreakdownJson = JSON.stringify(estimate);
            }

            // Insert contact submission
            await pool.query(
                `INSERT INTO contact_submissions
                 (first_name, last_name, email, phone, interest, message,
                  newsletter_signup, ip_address, user_agent, campaign_id,
                  referrer, utm_source, utm_medium, utm_campaign,
                  service_needs, budget_estimate, budget_tier, estimate_breakdown)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
                [firstName, lastName, email, phone || null, interest || 'services', message,
                 newsletter ? true : false, req.ip, req.get('User-Agent'),
                 campaignId || null, req.get('Referrer'),
                 req.query.utm_source || null, req.query.utm_medium || null, req.query.utm_campaign || null,
                 svcNeedsJson, estimate.total, estimate.tier, estimateBreakdownJson]
            );

            console.log(`New contact submission from: ${email} | Estimate: $${estimate.total} (${estimate.tier})`);

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
                const lineItemsHtml = estimate.lineItems.length
                    ? `<h3>💰 Deal Estimate: $${estimate.total.toLocaleString()} — ${estimate.tier}</h3>
                       <ul>${estimate.lineItems.map(li =>
                           `<li>${li.label} — $${li.price.toLocaleString()} (${li.type})</li>`
                       ).join('')}</ul>`
                    : '';
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER,
                    subject: `New Lead — ${firstName} ${lastName} | Est. $${estimate.total.toLocaleString()}`,
                    html: `
                        <h2>New Contact Form Submission</h2>
                        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                        <p><strong>Interest:</strong> ${interest || 'Services'}</p>
                        <p><strong>Message:</strong></p>
                        <p>${message}</p>
                        <p><strong>Newsletter Signup:</strong> ${newsletter ? 'Yes' : 'No'}</p>
                        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                        ${lineItemsHtml}
                    `
                };
                try {
                    await transporter.sendMail(mailOptions);
                } catch (emailError) {
                    console.error('Email sending error:', emailError);
                }
            }

            // SMS notification via Vonage
            await sendSmsAlert(`New lead: ${firstName} ${lastName} | ${email}${phone ? ' | ' + phone : ''} | Est. $${estimate.total.toLocaleString()}`);

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
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        const { email, firstName, lastName, campaignId } = req.body;

        try {
            await pool.query(
                `INSERT INTO newsletter_subscribers (email, first_name, last_name, campaign_id, source)
                 VALUES ($1,$2,$3,$4,$5) ON CONFLICT (email) DO NOTHING`,
                [email, firstName || null, lastName || null, campaignId || null, 'newsletter']
            );
            res.json({ 
                success: true, 
                message: 'Successfully subscribed to newsletter!' 
            });
        } catch (err) {
            console.error('Newsletter error:', err);
            res.status(500).json({ success: false, message: 'Subscription failed.' });
        }
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

            // Block superadmin from using the regular admin panel login
            if (user.role === 'superadmin') {
                return res.status(403).json({ error: 'Please use the Super Admin portal to sign in.' });
            }

            const validPassword = await bcrypt.compare(password, user.password_hash);
            if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            await pool.query(`UPDATE admin_users SET last_login = NOW() WHERE id = $1`, [user.id]);

            res.json({ 
                success: true, 
                token,
                user: { id: user.id, username: user.username, email: user.email, role: user.role }
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
                    newsletter_signup, status, submission_date,
                    COALESCE(source_website, 'Blue Ocean Website') as source_website,
                    utm_source, utm_medium, utm_campaign
             FROM contact_submissions ORDER BY submission_date DESC`
        );

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=blue-ocean-leads.csv');

        const headers = ['First Name','Last Name','Email','Phone','Interest','Message','Newsletter','Status','Date','Source Website','UTM Source','UTM Medium','UTM Campaign'];
        let csv = headers.join(',') + '\n';

        result.rows.forEach(row => {
            csv += [
                `"${row.first_name}"`, `"${row.last_name}"`, `"${row.email}"`, `"${row.phone || ''}"`,
                `"${row.interest || ''}"`, `"${(row.message || '').replace(/"/g, '""')}"`,
                row.newsletter_signup ? 'Yes' : 'No', `"${row.status || 'new'}"`,
                `"${row.submission_date}"`, `"${row.source_website || 'Blue Ocean Website'}"`,
                `"${row.utm_source || ''}"`, `"${row.utm_medium || ''}"`, `"${row.utm_campaign || ''}"`
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
    const { page = 1, limit = 25, search = '', status = '', interest = '', source_website = '', sort = 'submission_date', order = 'DESC' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const allowedSorts = ['submission_date', 'first_name', 'last_name', 'email', 'status', 'interest', 'source_website'];
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
        params.push(status);
        p++;
    }
    if (interest) {
        conditions.push(`interest = $${p}`);
        params.push(interest);
        p++;
    }
    if (source_website) {
        conditions.push(`source_website = $${p}`);
        params.push(source_website);
        p++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    try {
        const countRes = await pool.query(`SELECT COUNT(*) FROM contact_submissions ${where}`, params);
        const total = parseInt(countRes.rows[0].count);

        const leadsRes = await pool.query(
            `SELECT id, first_name, last_name, email, phone, interest, status, submission_date, utm_source, utm_medium, processed, source_website, source_website_id
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
app.get('/api/admin/leads/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const lead = (await pool.query('SELECT * FROM contact_submissions WHERE id = $1', [id])).rows[0];
        if (!lead) return res.status(404).json({ error: 'Lead not found' });
        lead.status = lead.status || 'new';

        const notes = (await pool.query('SELECT * FROM lead_notes WHERE lead_id = $1 ORDER BY created_at DESC', [id])).rows;
        const activities = (await pool.query('SELECT * FROM lead_activities WHERE lead_id = $1 ORDER BY created_at DESC LIMIT 50', [id])).rows;
        res.json({ lead, notes, activities });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// PUT /api/admin/leads/:id - update lead information
app.put('/api/admin/leads/:id', authenticateAdmin, [
    body('email').isEmail().normalizeEmail(),
    body('first_name').trim().isLength({ min: 1 }),
    body('last_name').trim().isLength({ min: 1 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { first_name, last_name, email, phone, interest, message, status, assigned_to } = req.body;

    try {
        const result = await pool.query(
            `UPDATE contact_submissions SET first_name=$1, last_name=$2, email=$3, phone=$4,
             interest=$5, message=$6, status=$7, assigned_to=$8, processed=TRUE WHERE id=$9`,
            [first_name, last_name, email, phone || null, interest || null, message, status || 'new', assigned_to || null, id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Lead not found' });

        await pool.query(
            'INSERT INTO lead_activities (lead_id, action_type, details, created_by) VALUES ($1,$2,$3,$4)',
            [id, 'updated', 'Lead information updated', req.user.username]
        );

        res.json({ success: true, message: 'Lead updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// PATCH /api/admin/leads/:id/status - quick status update
app.patch('/api/admin/leads/:id/status', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['new', 'contacted', 'qualified', 'proposal_sent', 'converted', 'not_interested'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    try {
        const result = await pool.query('UPDATE contact_submissions SET status=$1 WHERE id=$2', [status, id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Lead not found' });
        await pool.query(
            'INSERT INTO lead_activities (lead_id, action_type, details, created_by) VALUES ($1,$2,$3,$4)',
            [id, 'status_changed', `Status changed to: ${status}`, req.user.username]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// DELETE /api/admin/leads/:id - delete lead and all related data
app.delete('/api/admin/leads/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        // ON DELETE CASCADE handles notes + activities automatically
        const result = await pool.query('DELETE FROM contact_submissions WHERE id = $1', [id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Lead not found' });
        res.json({ success: true, message: 'Lead deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
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

    try {
        const lead = (await pool.query('SELECT * FROM contact_submissions WHERE id = $1', [id])).rows[0];
        if (!lead) return res.status(404).json({ error: 'Lead not found' });

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            return res.status(503).json({ error: 'Email service not configured. Add EMAIL_USER and EMAIL_PASS to your .env file.' });
        }

        await transporter.sendMail({
            from: `LaunchPoint DM <${process.env.EMAIL_USER}>`,
            to: `${lead.first_name} ${lead.last_name} <${lead.email}>`,
            subject,
            html: emailBody
        });

        await pool.query(
            'INSERT INTO lead_activities (lead_id, action_type, details, created_by) VALUES ($1,$2,$3,$4)',
            [id, 'email_sent', `Email sent — Subject: ${subject}`, req.user.username]
        );

        res.json({ success: true, message: `Email sent to ${lead.email}` });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ error: `Failed to send email: ${error.message}` });
    }
});

// POST /api/admin/leads/:id/sms - send SMS via Twilio
app.post('/api/admin/leads/:id/sms', authenticateAdmin, [
    body('message').trim().isLength({ min: 1, max: 1600 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { message: smsBody } = req.body;

    try {
        const lead = (await pool.query('SELECT * FROM contact_submissions WHERE id = $1', [id])).rows[0];
        if (!lead) return res.status(404).json({ error: 'Lead not found' });
        if (!lead.phone) return res.status(400).json({ error: 'This lead has no phone number on file.' });

        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE) {
            return res.status(503).json({ error: 'Twilio SMS service not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE to your .env file.' });
        }

        const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await twilio.messages.create({
            body: smsBody,
            from: process.env.TWILIO_PHONE,
            to: lead.phone
        });

        await pool.query(
            'INSERT INTO lead_activities (lead_id, action_type, details, created_by) VALUES ($1,$2,$3,$4)',
            [id, 'sms_sent', `SMS sent: "${smsBody.substring(0, 80)}${smsBody.length > 80 ? '...' : ''}"`, req.user.username]
        );

        res.json({ success: true, message: `SMS sent to ${lead.phone}` });
    } catch (error) {
        console.error('SMS error:', error);
        res.status(500).json({ error: `Failed to send SMS: ${error.message}` });
    }
});

// POST /api/admin/leads/:id/notes - add a note to a lead
app.post('/api/admin/leads/:id/notes', authenticateAdmin, [
    body('note').trim().isLength({ min: 1, max: 2000 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { note } = req.body;

    try {
        const noteRes = await pool.query(
            'INSERT INTO lead_notes (lead_id, note, created_by) VALUES ($1,$2,$3) RETURNING id',
            [id, note, req.user.username]
        );
        await pool.query(
            'INSERT INTO lead_activities (lead_id, action_type, details, created_by) VALUES ($1,$2,$3,$4)',
            [id, 'note_added', 'Note added to lead', req.user.username]
        );
        res.json({ success: true, id: noteRes.rows[0].id, message: 'Note added successfully' });
    } catch (error) {
        console.error('Add note error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// DELETE /api/admin/leads/:id/notes/:noteId - delete a note
app.delete('/api/admin/leads/:id/notes/:noteId', authenticateAdmin, async (req, res) => {
    const { noteId } = req.params;
    try {
        await pool.query('DELETE FROM lead_notes WHERE id = $1', [noteId]);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET /api/admin/stats - comprehensive dashboard stats
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    try {
        const [tot, tod, newL, cont, conv, subs, recent, byStatus, bySource] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM contact_submissions'),
            pool.query("SELECT COUNT(*) FROM contact_submissions WHERE submission_date::date = CURRENT_DATE"),
            pool.query("SELECT COUNT(*) FROM contact_submissions WHERE status='new' OR status IS NULL"),
            pool.query("SELECT COUNT(*) FROM contact_submissions WHERE status='contacted'"),
            pool.query("SELECT COUNT(*) FROM contact_submissions WHERE status='converted'"),
            pool.query('SELECT COUNT(*) FROM newsletter_subscribers WHERE active = TRUE'),
            pool.query('SELECT id, first_name, last_name, email, phone, interest, status, submission_date, source_website FROM contact_submissions ORDER BY submission_date DESC LIMIT 10'),
            pool.query('SELECT status, COUNT(*) as count FROM contact_submissions GROUP BY status'),
            pool.query(`SELECT COALESCE(source_website, 'Blue Ocean Website') as source, COUNT(*) as count FROM contact_submissions GROUP BY source_website ORDER BY count DESC`)
        ]);
        res.json({
            stats: {
                total:       parseInt(tot.rows[0].count),
                today:       parseInt(tod.rows[0].count),
                newLeads:    parseInt(newL.rows[0].count),
                contacted:   parseInt(cont.rows[0].count),
                converted:   parseInt(conv.rows[0].count),
                subscribers: parseInt(subs.rows[0].count)
            },
            recentLeads: recent.rows.map(r => ({ ...r, status: r.status || 'new' })),
            byStatus:    byStatus.rows.map(r => ({ ...r, status: r.status || 'new' })),
            bySource:    bySource.rows
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});


// =============================================
// NEWSLETTER MANAGEMENT ENDPOINTS
// =============================================

// GET /api/admin/newsletter/subscribers — list all subscribers
app.get('/api/admin/newsletter/subscribers', authenticateAdmin, async (req, res) => {
    try {
        const { search = '', active = '', page = 1, limit = 50 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        let paramIdx = 1;
        const conditions = [];
        const params = [];

        if (search) {
            conditions.push(`(email ILIKE $${paramIdx} OR first_name ILIKE $${paramIdx} OR last_name ILIKE $${paramIdx})`);
            params.push(`%${search}%`);
            paramIdx++;
        }
        if (active !== '') {
            conditions.push(`active = $${paramIdx}`);
            params.push(active === 'true');
            paramIdx++;
        }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const [rows, count] = await Promise.all([
            pool.query(`SELECT * FROM newsletter_subscribers ${where} ORDER BY subscription_date DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`, [...params, parseInt(limit), offset]),
            pool.query(`SELECT COUNT(*) FROM newsletter_subscribers ${where}`, params)
        ]);

        res.json({ subscribers: rows.rows, total: parseInt(count.rows[0].count) });
    } catch (err) {
        console.error('Newsletter subscribers error:', err);
        res.status(500).json({ error: 'Failed to fetch subscribers' });
    }
});

// GET /api/admin/newsletter/history — list sent newsletters
app.get('/api/admin/newsletter/history', authenticateAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM newsletters_sent ORDER BY sent_at DESC LIMIT 50'
        );
        res.json({ newsletters: result.rows });
    } catch (err) {
        console.error('Newsletter history error:', err);
        res.status(500).json({ error: 'Failed to fetch newsletter history' });
    }
});

// POST /api/admin/newsletter/send — compose and send newsletter to all active subscribers
app.post('/api/admin/newsletter/send', authenticateAdmin, [
    body('subject').trim().isLength({ min: 1, max: 300 }),
    body('bodyHtml').trim().isLength({ min: 1 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { subject, bodyHtml } = req.body;

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return res.status(503).json({ error: 'Email service not configured. Add EMAIL_USER and EMAIL_PASS to your .env file.' });
    }

    try {
        // Fetch all active subscribers
        const result = await pool.query(
            'SELECT * FROM newsletter_subscribers WHERE active = TRUE ORDER BY subscription_date ASC'
        );
        const subscribers = result.rows;

        if (subscribers.length === 0) {
            return res.status(400).json({ error: 'No active subscribers to send to.' });
        }

        // Build unsubscribe-aware HTML wrapper
        const wrapEmail = (sub, html) => `
            <div style="max-width:660px;margin:0 auto;font-family:Arial,sans-serif;color:#222;">
                ${html}
                <hr style="margin:40px 0;border:none;border-top:1px solid #e5e7eb;">
                <p style="font-size:12px;color:#6b7280;text-align:center;">
                    You're receiving this because you subscribed at <strong>LaunchPoint DM</strong>.<br>
                    To unsubscribe, <a href="${process.env.ADMIN_URL ? process.env.ADMIN_URL.replace('/admin','') : 'http://localhost:3300'}/api/unsubscribe?email=${encodeURIComponent(sub.email)}" style="color:#6b7280;">click here</a>.
                </p>
            </div>`;

        let sent = 0;
        let failed = 0;

        // Send in small batches to avoid rate limits
        const BATCH = 10;
        for (let i = 0; i < subscribers.length; i += BATCH) {
            const batch = subscribers.slice(i, i + BATCH);
            await Promise.allSettled(batch.map(sub =>
                transporter.sendMail({
                    from: `LaunchPoint DM <${process.env.EMAIL_USER}>`,
                    to:   sub.email,
                    subject,
                    html:  wrapEmail(sub, bodyHtml)
                }).then(() => sent++).catch(() => failed++)
            ));
        }

        // Record in history
        await pool.query(
            'INSERT INTO newsletters_sent (subject, body_html, sent_by, recipient_count, status) VALUES ($1,$2,$3,$4,$5)',
            [subject, bodyHtml, req.user.username, sent, sent > 0 ? 'sent' : 'failed']
        );

        res.json({
            success: true,
            message: `Newsletter sent to ${sent} subscriber${sent !== 1 ? 's' : ''}.${failed > 0 ? ` (${failed} failed)` : ''}`
        });
    } catch (err) {
        console.error('Newsletter send error:', err);
        res.status(500).json({ error: `Failed to send newsletter: ${err.message}` });
    }
});

// PATCH /api/admin/newsletter/subscribers/:id/status — activate or deactivate a subscriber
app.patch('/api/admin/newsletter/subscribers/:id/status', authenticateAdmin, async (req, res) => {
    const { active } = req.body;
    try {
        const result = await pool.query(
            'UPDATE newsletter_subscribers SET active = $1 WHERE id = $2 RETURNING *',
            [!!active, req.params.id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Subscriber not found' });
        res.json({ success: true, subscriber: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Public unsubscribe link handler
app.get('/api/unsubscribe', async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).send('Invalid unsubscribe link.');
    try {
        await pool.query('UPDATE newsletter_subscribers SET active = FALSE WHERE email = $1', [email]);
        res.send(`<html><body style="font-family:sans-serif;text-align:center;padding:60px;"><h2>Unsubscribed</h2><p>You've been successfully removed from our newsletter list.</p></body></html>`);
    } catch (err) {
        res.status(500).send('Error processing unsubscribe request.');
    }
});

// POST /api/analytics — client-side event tracking
app.post('/api/analytics', async (req, res) => {
    try {
        const {
            event_name, page_url, user_agent,
            utm_source, utm_medium, utm_campaign,
            campaign_id, ...rest
        } = req.body || {};

        if (!event_name) return res.status(400).json({ error: 'event_name is required' });

        await pool.query(
            `INSERT INTO analytics_events
             (event_type, page_url, user_ip, user_agent, referrer, utm_source, utm_medium, utm_campaign, event_data, campaign_id)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [
                event_name,
                page_url || req.get('Referer') || null,
                req.ip,
                user_agent || req.get('User-Agent'),
                req.get('Referer') || null,
                utm_source || null,
                utm_medium || null,
                utm_campaign || null,
                JSON.stringify(rest),
                campaign_id || null
            ]
        );

        res.json({ success: true });
    } catch (err) {
        console.error('Analytics event error:', err);
        res.status(500).json({ error: 'Failed to record event' });
    }
});


// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(error.status || 500).json({
        error: 'An unexpected error occurred',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
});

// =============================================
// SUPER ADMIN — Helper utilities
// =============================================

function generateUsername(fullName) {
    const firstName = (fullName || 'admin').split(' ')[0].toLowerCase().replace(/[^a-z]/g, '').substring(0, 8);
    const suffix = crypto.randomBytes(3).toString('hex');
    return `${firstName}_${suffix}`;
}

function generateTempPassword() {
    return crypto.randomBytes(8).toString('hex').substring(0, 12);
}

async function sendApprovalEmail(to, fullName, username, tempPassword) {
    const adminUrl = process.env.ADMIN_URL || `http://localhost:${PORT}/admin`;
    const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f1729;color:#e2e8f0;padding:40px;border-radius:16px">
        <div style="text-align:center;margin-bottom:32px">
            <div style="font-size:48px;margin-bottom:12px">🚀</div>
            <h1 style="color:#4db8ff;margin:0">LaunchPoint DM</h1>
        </div>
        <p>Hello ${fullName},</p>
        <p>Your request for admin access has been <strong style="color:#2ecc71">approved</strong>. Here are your login credentials:</p>
        <div style="background:#1a2540;border:1px solid #2d3a5c;border-radius:12px;padding:20px;margin:24px 0">
            <p style="margin:0 0 10px"><strong>Portal:</strong> <a href="${adminUrl}" style="color:#4db8ff">${adminUrl}</a></p>
            <p style="margin:0 0 10px"><strong>Username:</strong> <code style="background:#0f1729;padding:2px 8px;border-radius:4px;color:#4db8ff;font-size:15px">${username}</code></p>
            <p style="margin:0"><strong>Temporary Password:</strong> <code style="background:#0f1729;padding:2px 8px;border-radius:4px;color:#4db8ff;font-size:15px">${tempPassword}</code></p>
        </div>
        <p style="color:#f39c12">⚠️ Please log in and change your password immediately after first login.</p>
        <p>Welcome to the team!<br>— LaunchPoint DM</p>
        <p style="color:#64748b;font-size:11px;margin-top:32px;border-top:1px solid #1e2d4a;padding-top:16px">LaunchPoint DM — Digital Marketing Platform</p>
    </div>`;

    if (process.env.EMAIL_USER) {
        try {
            await transporter.sendMail({
                from: `"LaunchPoint DM" <${process.env.EMAIL_USER}>`,
                html
            });
        } catch (e) {
            console.error('Approval email error:', e.message);
        }
    } else {
        console.log(`[APPROVAL EMAIL] To: ${to} | Username: ${username} | Password: ${tempPassword}`);
    }
}

async function sendRejectionEmail(to, fullName, reason) {
    const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f1729;color:#e2e8f0;padding:40px;border-radius:16px">
        <div style="text-align:center;margin-bottom:32px">
            <div style="font-size:48px;margin-bottom:12px">🚀</div>
            <h1 style="color:#4db8ff;margin:0">LaunchPoint DM</h1>, your request for access was <strong style="color:#e74c3c">not approved</strong> at this time.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>If you believe this is an error, please contact your campaign manager.</p>
        <p>— LaunchPoint DM</p>
    </div>`;

    if (process.env.EMAIL_USER) {
        try {
            await transporter.sendMail({
                from: `"LaunchPoint DM" <${process.env.EMAIL_USER}>`,
                to,
                subject: 'LaunchPoint DM Admin Access Request Update',
                html
            });
        } catch (e) {
            console.error('Rejection email error:', e.message);
        }
    }
}

// =============================================
// SUPER ADMIN LOGIN  (separate from admin login)
// =============================================

app.post('/api/superadmin/login',
    [
        body('username').trim().notEmpty(),
        body('password').notEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        const { username, password } = req.body;
        try {
            const result = await pool.query(
                `SELECT * FROM admin_users WHERE username = $1 AND role = 'superadmin' AND active = TRUE`,
                [username]
            );
            const user = result.rows[0];
            if (!user) return res.status(401).json({ error: 'Invalid credentials' });
            const valid = await bcrypt.compare(password, user.password_hash);
            if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
            const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
            await pool.query(`UPDATE admin_users SET last_login = NOW() WHERE id = $1`, [user.id]);
            res.json({ success: true, token, user: { id: user.id, username: user.username, role: user.role } });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// =============================================
// PUBLIC — Admin registration request
// =============================================

app.post('/api/admin/register',
    formLimiter,
    [
        body('fullName').trim().isLength({ min: 2, max: 100 }).matches(/^[a-zA-Z\s'-]+$/),
        body('email').isEmail().normalizeEmail(),
        body('organization').optional().trim().isLength({ max: 200 }),
        body('reason').optional().trim().isLength({ max: 1000 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        const { fullName, email, organization, reason } = req.body;
        try {
            // Prevent duplicate pending requests
            const existing = await pool.query(
                `SELECT id FROM admin_registrations WHERE email = $1 AND status = 'pending'`,
                [email]
            );
            if (existing.rows.length > 0) {
                return res.status(409).json({ error: 'A pending request with this email already exists.' });
            }
            // Prevent already-approved admins from re-registering
            const alreadyAdmin = await pool.query(`SELECT id FROM admin_users WHERE email = $1`, [email]);
            if (alreadyAdmin.rows.length > 0) {
                return res.status(409).json({ error: 'This email is already registered as an admin.' });
            }
            await pool.query(
                `INSERT INTO admin_registrations (full_name, email, organization, reason) VALUES ($1,$2,$3,$4)`,
                [fullName, email, organization || null, reason || null]
            );
            res.json({ success: true, message: 'Registration request submitted. You will be notified by email once reviewed.' });
        } catch (err) {
            console.error('Registration error:', err);
            res.status(500).json({ error: 'Failed to submit request.' });
        }
    }
);

// =============================================
// SUPER ADMIN — Registration management
// =============================================

// List all registrations
app.get('/api/superadmin/registrations', authenticateSuperAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        let q = `SELECT * FROM admin_registrations`;
        const params = [];
        if (status) { q += ` WHERE status = $1`; params.push(status); }
        q += ` ORDER BY created_at DESC`;
        const result = await pool.query(q, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch registrations.' });
    }
});

// Approve a registration → create admin account → send email
app.post('/api/superadmin/registrations/:id/approve', authenticateSuperAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const reg = await pool.query(`SELECT * FROM admin_registrations WHERE id = $1`, [id]);
        if (!reg.rows[0]) return res.status(404).json({ error: 'Request not found.' });
        if (reg.rows[0].status !== 'pending') return res.status(400).json({ error: 'Request is not pending.' });

        const { full_name, email } = reg.rows[0];
        const username = generateUsername(full_name);
        const tempPassword = generateTempPassword();
        const passwordHash = await bcrypt.hash(tempPassword, 10);

        await pool.query(
            `INSERT INTO admin_users (username, email, password_hash, role, active) VALUES ($1,$2,$3,'admin',TRUE)`,
            [username, email, passwordHash]
        );
        await pool.query(
            `UPDATE admin_registrations SET status='approved', reviewed_by=$1, reviewed_at=NOW() WHERE id=$2`,
            [req.user.username, id]
        );

        await sendApprovalEmail(email, full_name, username, tempPassword);

        res.json({ success: true, username, message: `Approved. Credentials emailed to ${email}.` });
    } catch (err) {
        console.error('Approval error:', err);
        res.status(500).json({ error: 'Failed to approve request.' });
    }
});

// Reject a registration
app.post('/api/superadmin/registrations/:id/reject', authenticateSuperAdmin, [
    body('reason').optional().trim().isLength({ max: 500 })
], async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    try {
        const reg = await pool.query(`SELECT * FROM admin_registrations WHERE id = $1`, [id]);
        if (!reg.rows[0]) return res.status(404).json({ error: 'Request not found.' });
        if (reg.rows[0].status !== 'pending') return res.status(400).json({ error: 'Request is not pending.' });

        await pool.query(
            `UPDATE admin_registrations SET status='rejected', reviewed_by=$1, reviewed_at=NOW(), rejection_reason=$2 WHERE id=$3`,
            [req.user.username, reason || null, id]
        );
        await sendRejectionEmail(reg.rows[0].email, reg.rows[0].full_name, reason);
        res.json({ success: true, message: 'Request rejected.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to reject request.' });
    }
});

// =============================================
// SUPER ADMIN — Admin user management
// =============================================

// List all admin users (excludes superadmin from deletion)
app.get('/api/superadmin/admins', authenticateSuperAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, username, email, role, active, created_date, last_login
             FROM admin_users WHERE role != 'superadmin' ORDER BY created_date DESC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch admins.' });
    }
});

// Toggle admin active status
app.put('/api/superadmin/admins/:id/toggle', authenticateSuperAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `UPDATE admin_users SET active = NOT active WHERE id = $1 AND role != 'superadmin' RETURNING id, username, active`,
            [id]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'Admin not found or protected.' });
        res.json({ success: true, admin: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to toggle admin.' });
    }
});

// Remove admin user permanently
app.delete('/api/superadmin/admins/:id', authenticateSuperAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `DELETE FROM admin_users WHERE id = $1 AND role != 'superadmin' RETURNING id`,
            [id]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'Admin not found or protected.' });
        res.json({ success: true, message: 'Admin account removed.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to remove admin.' });
    }
});

// =============================================
// SUPER ADMIN — LEAD MANAGEMENT
// =============================================

// GET all leads for super admin with optional filters
app.get('/api/superadmin/leads', authenticateSuperAdmin, async (req, res) => {
    const { assigned_to, status, unassigned, page = 1, limit = 100 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];

    if (status) {
        params.push(status);
        conditions.push(`cs.status = $${params.length}`);
    }
    if (unassigned === 'true') {
        conditions.push(`(cs.assigned_to IS NULL OR cs.assigned_to = '')`);
    } else if (assigned_to) {
        params.push(assigned_to);
        conditions.push(`cs.assigned_to = $${params.length}`);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    try {
        const [leadsResult, countResult, adminsResult] = await Promise.all([
            pool.query(
                `SELECT cs.id, cs.name, cs.email, cs.phone, cs.status, cs.assigned_to,
                        cs.submission_date, cs.service_interest, cs.source_url
                 FROM contact_submissions cs
                 ${where}
                 ORDER BY cs.submission_date DESC
                 LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
                [...params, parseInt(limit), offset]
            ),
            pool.query(
                `SELECT COUNT(*) FROM contact_submissions cs ${where}`,
                params
            ),
            pool.query(
                `SELECT username FROM admin_users WHERE role = 'admin' AND active = TRUE ORDER BY username`
            )
        ]);

        const unassignedCount = await pool.query(
            `SELECT COUNT(*) FROM contact_submissions WHERE assigned_to IS NULL OR assigned_to = ''`
        );

        res.json({
            leads: leadsResult.rows,
            total: parseInt(countResult.rows[0].count),
            unassigned_count: parseInt(unassignedCount.rows[0].count),
            admins: adminsResult.rows.map(r => r.username)
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load leads.' });
    }
});

// PATCH — assign one or multiple leads to an admin user
app.patch('/api/superadmin/leads/assign', authenticateSuperAdmin, async (req, res) => {
    const { lead_ids, assigned_to } = req.body;
    if (!Array.isArray(lead_ids) || lead_ids.length === 0) {
        return res.status(400).json({ error: 'lead_ids must be a non-empty array.' });
    }
    // assigned_to can be null/empty to unassign
    const assignValue = assigned_to || null;
    try {
        const result = await pool.query(
            `UPDATE contact_submissions SET assigned_to = $1 WHERE id = ANY($2::int[]) RETURNING id`,
            [assignValue, lead_ids]
        );
        res.json({ success: true, updated: result.rowCount });
    } catch (err) {
        res.status(500).json({ error: 'Failed to assign leads.' });
    }
});

// =============================================
// SUPER ADMIN PAGE ROUTES
// =============================================

app.get('/superadmin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'superadmin.html'));
});

app.get('/admin-register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-register.html'));
});

// 404 handler — serve SPA for unknown routes (client-side router handles /404)
app.use((req, res) => {
    if (fs.existsSync(distIndex)) {
        return res.status(200).sendFile(distIndex);
    }
    res.status(404).send('Page not found');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    pool.end().then(() => {
        console.log('Database pool closed.');
        process.exit(0);
    }).catch(err => {
        console.error('Error closing pool:', err.message);
        process.exit(1);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 LaunchPoint DM running on port ${PORT}`);
    console.log(`📊 Admin panel available at: http://localhost:${PORT}/admin`);
    console.log(`📧 Contact forms will be stored in database`);
});

module.exports = app;