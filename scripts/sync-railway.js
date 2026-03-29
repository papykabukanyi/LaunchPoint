#!/usr/bin/env node
/**
 * Syncs .env to Railway via GraphQL API - no CLI project link required.
 * Run: npm run railway:sync
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

const ROOT = path.join(__dirname, "..");
const ENV_PATH = path.join(ROOT, ".env");
const RAILWAY_CONFIG = path.join(os.homedir(), ".railway", "config.json");
const RAILWAY_API = "https://backboard.railway.app/graphql/v2";

const OVERRIDES = { NODE_ENV: "production" };
const SKIP_KEYS = ["PORT"];

function parseEnv(filePath) {
    const vars = {};
    const content = fs.readFileSync(filePath, "utf8");
    for (const line of content.split("\n")) {
        const t = line.trim();
        if (!t || t.startsWith("#")) continue;
        const eq = t.indexOf("=");
        if (eq === -1) continue;
        const key = t.slice(0, eq).trim();
        const val = t.slice(eq + 1).trim();
        if (!key || SKIP_KEYS.includes(key)) continue;
        vars[key] = key in OVERRIDES ? OVERRIDES[key] : val;
    }
    return vars;
}

async function gql(token, query, variables = {}) {
    const res = await fetch(RAILWAY_API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
        },
        body: JSON.stringify({ query, variables }),
    });
    const json = await res.json();
    if (json.errors) throw new Error(json.errors.map(e => e.message).join("; "));
    return json.data;
}

async function main() {
    if (!fs.existsSync(RAILWAY_CONFIG)) {
        console.error("No Railway config found. Run: railway login");
        process.exit(1);
    }
    const config = JSON.parse(fs.readFileSync(RAILWAY_CONFIG, "utf8"));
    const token = config.user && config.user.token;
    if (!token) {
        console.error("No token in Railway config. Run: railway login");
        process.exit(1);
    }

    console.log("Finding your Railway project...");
    const data = await gql(token, `
        query {
            me {
                projects(first: 50) {
                    edges {
                        node {
                            id name
                            environments { edges { node { id name } } }
                            services { edges { node { id name } } }
                        }
                    }
                }
            }
        }
    `);

    const projects = data.me.projects.edges.map(e => e.node);
    console.log("Found projects:", projects.map(p => p.name).join(", ") || "(none)");

    const project = projects.find(p =>
        p.name.toLowerCase().includes("launch")
    ) || projects[0];

    if (!project) {
        console.error("No projects found. Deploy your project on railway.app first.");
        process.exit(1);
    }
    console.log("Using project:", project.name, "("+project.id+")");

    const envs = project.environments.edges.map(e => e.node);
    const env = envs.find(e => e.name.toLowerCase() === "production") || envs[0];
    if (!env) { console.error("No environment found."); process.exit(1); }
    console.log("Environment:", env.name, "("+env.id+")");

    const services = project.services.edges.map(e => e.node);
    const service = services.find(s =>
        !s.name.toLowerCase().includes("postgres") &&
        !s.name.toLowerCase().includes("database")
    ) || services[0];
    if (!service) { console.error("No service found."); process.exit(1); }
    console.log("Service:", service.name, "("+service.id+")");

    if (!fs.existsSync(ENV_PATH)) { console.error(".env not found at", ENV_PATH); process.exit(1); }
    const vars = parseEnv(ENV_PATH);
    console.log("\nPushing", Object.keys(vars).length, "variables...\n");
    Object.keys(vars).forEach(k => {
        const mask = ["KEY","SECRET","PASSWORD","API","TOKEN"].some(s => k.toUpperCase().includes(s));
        console.log(" ", k, "=", mask ? "••••••" : vars[k]);
    });

    await gql(token, `
        mutation UpsertVars($input: VariableCollectionUpsertInput!) {
            variableCollectionUpsert(input: $input)
        }
    `, {
        input: {
            projectId: project.id,
            environmentId: env.id,
            serviceId: service.id,
            variables: vars,
        }
    });

    console.log("\nAll variables pushed to Railway! Redeploy triggered.\n");
}

main().catch(err => {
    console.error("Error:", err.message);
    process.exit(1);
});
