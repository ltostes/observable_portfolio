import duckdb from "duckdb";
import { readFile, unlink } from 'fs/promises';

import { PROFILE_IDS_LIST, MULTI_PROFILES } from './teamdefinitions.js';
import { fetchProfiles, fetchMatches } from './fetchgetfunctions.js';

async function main() {
    // Connect to the cache instance (or create a new one)
    const dbpath = './src/.observablehq/cache/data/cs2teamdedication/database.db';
    // const dbpath = 'tmp.db';

    const db = new duckdb.Database(dbpath);
    const connection = db.connect();

    // Execute SQL commands to setup the database
    await connection.run('CREATE OR REPLACE TABLE profiles (id VARCHAR, name VARCHAR)');

    await connection.run('CREATE OR REPLACE TABLE fromage (message VARCHAR)');
    await connection.run(`INSERT INTO framboise VALUES (?::VARCHAR)`, "banana");

    // Fetching data
    let profiles = [];
    try {
        // Collecting profile info
        profiles = await fetchProfiles(PROFILE_IDS_LIST);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
    // Inserting into DB
    try {

        // Iterate over the items and insert them into the database
        for (const profile of profiles) {
            await connection.run(`INSERT INTO profiles VALUES (${profile.meta.steam64Id}, '${profile.meta.name}')`);
        }

    } catch (error) {
        console.error('Error inserting data:', error);
    }


    // Disconnect and close database
    await connection.close();
    db.close();

    // Delaying a bit to make sure file is fully written before we send to stdout
    function delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }
    await delay(5000);

    // Reading DB file into stdout
    const data = await readFile(dbpath);

    process.stdout.write(data);
}

main().catch(err => console.error('An error occurred:', err));
