import { readFile } from 'fs/promises';
import JSZip from "jszip";

import { PROFILE_IDS_LIST, MULTI_PROFILES } from './teamdefinitions.js';
import { fetchProfiles, fetchMatches } from './fetchgetfunctions.js';

async function main() {

    let retrievalInfo = {};

    // Fetching profiles data
    let profiles = [];
    try {
        // Collecting profile info
        profiles = await fetchProfiles(PROFILE_IDS_LIST);
    } catch (error) {
        console.error('Error fetching profiles:', error);
    }

    // Now getting the cache of matches details
    const matchesCachePath = './src/.observablehq/cache/data/cs2teamdedication/data/matches.json';
    let cachedMatches = [];
    try {
        // Attempt to read the file
        const data = await readFile(matchesCachePath);
        cachedMatches = JSON.parse(data);
    } catch (error) {
        // Check if the error is due to the file not existing
        if (error.code === 'ENOENT') {
            // File just doesn't exist yet so we can continue (it will be as there are no cached matches)
        } else {
            // Handle other possible errors
            console.error('Error reading cached matches:', error);
        }
    }

    // Now calculating the matches we have yet to retrieve
    const allPlayedMatches = [...new Set(profiles.map(p => [...p.games.map(g => g.gameId)]).flat())];
    const matchesToRetrieve = allPlayedMatches.filter(f => !cachedMatches.map(m => m.id).includes(f));

    retrievalInfo = {...retrievalInfo, profiles, allPlayedMatches, matchesToRetrieve};

    // Now fetching matches
    let retrievedMatches = [];
    try {
        // Collecting profile info
        retrievedMatches = await fetchMatches(matchesToRetrieve);
    } catch (error) {
        console.error('Error fetching matches:', error);
    }

    const matches = [...cachedMatches, ...retrievedMatches];

    retrievalInfo = {...retrievalInfo, cachedMatches, retrievedMatches, matches};


    // Output a ZIP archive to stdout.
    const zip = new JSZip();
    zip.file("retrievalinfo.json", JSON.stringify(retrievalInfo, null, 2));
    zip.file("profiles.json", JSON.stringify(profiles, null, 2));
    zip.file("matches.json", JSON.stringify(matches, null, 2));
    zip.generateNodeStream().pipe(process.stdout);

}

main().catch(err => console.error('An error occurred:', err));
