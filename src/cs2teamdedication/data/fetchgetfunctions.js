import fetch from 'node-fetch';

export async function fetchProfile(profile_id) {
    const url = `https://api.leetify.com/api/profile/${profile_id}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data; // Return the fetched data
    } catch (error) {
      console.error("Error fetching profile:", profile_num, error);
      throw error; // Throw an error if something goes wrong
    }
  }

export async function fetchProfiles(profiles) {
  try {
    // Map over profiles and create a fetch promise for each
    const promises = profiles.map((profile_id) => fetchProfile(profile_id));

    // Wait for all promises to resolve
    const results = await Promise.all(promises);
    return results; // Return the array of results
  } catch (error) {
    console.error("Error fetching profiles:", error);
    throw error; // Handle errors appropriately
  }
}

export async function fetchMatchDetails(matchId) {
  const url = `https://api.leetify.com/api/games/${matchId}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data; // Return the fetched data
  } catch (error) {
    console.error("Error fetching match details:", matchId, error);
    throw error; // Throw an error if something goes wrong
  }
}

export async function fetchMatches(matches) {
  try {
    // Map over profiles and create a fetch promise for each
    const promises = matches.map((matchId) => fetchMatchDetails(matchId));

    // Wait for all promises to resolve
    const results = await Promise.all(promises);
    return results; // Return the array of results
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw error; // Handle errors appropriately
  }
}