import { readFile } from 'fs/promises';
import JSZip from "jszip";

import { PROFILE_LIST, MULTI_PROFILES, dateRounding, gameSort } from './constantsdefinitions.js';
import { fetchProfiles, fetchMatches } from './fetchgetfunctions.js';

async function main() {

    let infoForDebugging = {};

    // Fetching profiles data
    let profiles = [];
    try {
        // Collecting profile info
        profiles = await fetchProfiles(PROFILE_LIST.map(p => p.id));
    } catch (error) {
        console.error('Error fetching profiles:', error);
    }

    // Getting the cache of matches details
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

    // Calculating the matches we have yet to retrieve
    const allPlayedMatches = [...new Set(profiles.map(p => [...p.games.map(g => g.gameId)]).flat())];
    const matchesToRetrieve = allPlayedMatches.filter(f => !cachedMatches.map(m => m.id).includes(f));

    infoForDebugging = {...infoForDebugging, profiles, allPlayedMatches, matchesToRetrieve};

    // Fetching matches
    let retrievedMatches = [];
    try {
        // Collecting profile info
        retrievedMatches = await fetchMatches(matchesToRetrieve);
    } catch (error) {
        console.error('Error fetching matches:', error);
    }

    const matches = [...cachedMatches, ...retrievedMatches];

    infoForDebugging = {...infoForDebugging, numCachedMatches: cachedMatches.length, numRetrievedMatches: retrievedMatches.length};

    ////
    //  Data tuning
    ////

    // Pruning matches dataframe
    const matchesBaseDF = matches.map(match => ({
        ...match,
        sessionDate: dateRounding(match.createdAt),
        numTeamMembers: match.playerStats.filter(f => profiles.map(p => p.meta.steam64Id).includes(f.steam64Id)).length,
        playerStats: match.playerStats.map(playerStat => ({...playerStat, isTeamMember: profiles.map(p => p.meta.steam64Id).includes(playerStat.steam64Id)}))
    }))
    .sort(gameSort("createdAt"))
    
    // Pruning profiles dataframe
    const profilesBaseDF = profiles
                            .filter(profile => !Object.keys(MULTI_PROFILES).includes(profile.meta.name))
                            .map(profile => ({
                                name: profile.meta.name ?? PROFILE_LIST.find(f => f.id == profile.meta.steam64Id).altname,
                                id: profile.meta.steam64Id,
                                avatar: profile.meta.steamAvatarUrl,
                                recentRatings: profile.recentGameRatings,
                                personalBestsCS2: profile.personalBestsCs2,
                                games: profile.games
                            }))

    // Profile-match relations, considering multi profiles
    const profileBaseWithMatches = profilesBaseDF
                            .map(profile => ({ // Listing all profiles that belong to this same profile (multi-profiles)
                                ...profile,
                                allProfiles: [ 
                                    {id: profile.id, name: profile.name},
                                    ...Object.entries(MULTI_PROFILES)
                                        .filter(([extraprofile, mainprofile]) => mainprofile == profile.name)
                                        .map(([extraprofile, mainprofile]) => ({name: extraprofile, id: PROFILE_LIST.find(f => f.altname == extraprofile).id}))
                                ],
                            }))
                            .map(profile => ({ // Populating gameIds with games from all profiles, in chronological order
                                ...profile,
                                gameIds: [ 
                                    ...profile.games
                                    , ...profile.allProfiles.slice(1).map(ap => profiles.find(f => f.meta.name == ap.name)?.games ?? [])
                                ]
                                .flat()
                                .sort(gameSort("gameFinishedAt"))
                                .map(game => game.gameId)
                            }))
                            .map(profile => ({ // Making sure there are no duplicates
                                ...profile,
                                gameIds: [...new Set(profile.gameIds)]
                            }))
                            .map(profile => ({ // Populating with match details
                                ...profile,
                                games: profile.gameIds.map(gameId => {
                                    const matchDetails = matchesBaseDF.find(f => f.id == gameId);
                                    // TO FIX THIS HERE, SINCE IT DOESN'T CATCH MULTIPROFILES
                                    const profilePlayerStats = matchDetails.playerStats.find(f => profile.allProfiles.map(ap => ap.id).includes(f.steam64Id))
                                    return {...matchDetails, profilePlayerStats}
                                })
                            }))

    // Building the team matches DF
    const teamMatchesDF = matchesBaseDF.map(match => ({
        profile: "Team",
        ...match
    }))

    // infoForDebugging = {...infoForDebugging, profilesBaseDF, profileBaseWithMatches, profileMatchesDF, profilesDF};

    // Output a ZIP archive to stdout.
    const zip = new JSZip();
    zip.file("infoForDebugging.json", JSON.stringify(infoForDebugging, null, 2)); // Used for debugging this data loader
    zip.file("profiles_matches.json", JSON.stringify(profileBaseWithMatches, null, 2));
    zip.file("team_matches.json", JSON.stringify(teamMatchesDF, null, 2));
    zip.file("raw_profiles.json", JSON.stringify(profiles, null, 2));
    zip.file("raw_matches.json", JSON.stringify(matches, null, 2));
    zip.generateNodeStream().pipe(process.stdout);
    
}

main().catch(err => console.error('An error occurred:', err));
