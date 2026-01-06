const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Helper to test credentials
async function testCredentials(user, pass, source) {
    if (!user || !pass) {
        console.log(`❌ [${source}] Missing credentials.`);
        return false;
    }

    console.log(`Testing credentials from [${source}]...`);
    // console.log(`User: ${user}`);
    // console.log(`Pass: ${pass.substring(0, 3)}...`); // Hide partial password

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
    });

    try {
        await transporter.verify();
        console.log(`✅ [${source}] Credentials are VALID!`);
        return true;
    } catch (error) {
        console.log(`❌ [${source}] Credentials failed: ${error.message}`);
        return false;
    }
}

async function main() {
    // 1. Test .env
    const envPath = path.join(__dirname, '.env');
    let envConfig = {};
    if (fs.existsSync(envPath)) {
        envConfig = dotenv.parse(fs.readFileSync(envPath));
    }

    // 2. Test .env.local
    const localEnvPath = path.join(__dirname, '.env.local');
    let localEnvConfig = {};
    if (fs.existsSync(localEnvPath)) {
        localEnvConfig = dotenv.parse(fs.readFileSync(localEnvPath));
    }

    console.log('--- Email Credential Verification ---');

    let validFound = false;

    // Test .env
    if (await testCredentials(envConfig.EMAIL_USER, envConfig.EMAIL_PASSWORD, '.env')) {
        validFound = true;
    }

    // Test .env.local
    // Note: dotenv.parse handles quotes, so values should be clean.
    if (await testCredentials(localEnvConfig.EMAIL_USER, localEnvConfig.EMAIL_PASSWORD, '.env.local')) {
        validFound = true;
    }

    if (!validFound) {
        console.log('\n❌ No valid credentials found in .env or .env.local');
        console.log('Please generate a new App Password from Google Account > Security > 2-Step Verification > App Passwords.');
    } else {
        console.log('\n✅ At least one valid credential set found.');
    }
}

main().catch(console.error);
