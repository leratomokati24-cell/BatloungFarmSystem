
const bcrypt = require('bcryptjs');
const readline = require('readline');
const { db } = require('./config/db');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

async function askPassword() {
    return new Promise((resolve) => {
        process.stdout.write('Enter administrator password: ');

        let password = '';

        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        const onData = (key) => {
            if (key === '\u0003') {
                process.exit();
            }

            if (key === '\r' || key === '\n') {
                process.stdin.setRawMode(false);
                process.stdin.pause();
                process.stdin.removeListener('data', onData);
                process.stdout.write('\n');
                resolve(password);
            } else if (key === '\u007f' || key === '\b') {
                password = password.slice(0, -1);
            } else {
                password += key;
            }
        };

        process.stdin.on('data', onData);
    });
}

async function createAdmin() {
    try {
        const fullName = await ask('Enter administrator full name: ');
        const username = await ask('Enter administrator username: ');
        const password = await askPassword();

        if (!fullName.trim() || !username.trim() || password.length < 8) {
            console.log('Please enter all details. Password must have at least 8 characters.');
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            `INSERT INTO users (full_name, username, password_hash, role)
             VALUES (?, ?, ?, 'ADMIN')`,
            [fullName.trim(), username.trim(), hashedPassword]
        );

        console.log('Administrator account created successfully!');

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            console.log('That username already exists. Choose another username.');
        } else {
            console.error('Error:', error.message);
        }
    } finally {
        rl.close();
        await db.end();
    }
}

createAdmin();
