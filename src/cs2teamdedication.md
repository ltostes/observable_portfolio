---
title: CS2 Team Dedication Report
toc: false
theme: air
style: /cs2teamdedication/style.css
---

# ${teamname}
#### _CS2 Team Dedication Performance Report_

```js
const x_domain = [today, d3.utcDay.offset(today, -timeRange)];
function dateFilter(date) {
  return (date >= x_domain[1]) && (date <= x_domain[0])
}

const ordering_1 = "sessionStreak";
const ordering_2 = "daysSinceLastGame";
const ordering_3 = "gameCountLast30days";

const fy_domain = profilesDF.sort((a,b) => 
                      d3.descending(a[ordering_1], b[ordering_1]) ||
                      d3.ascending(a[ordering_2], b[ordering_2]) ||
                      d3.descending(a[ordering_3], b[ordering_3])
                    ).map(p => p.name)
```

```js
view(Plot.plot({
  width: width,
  height: 700,
  marginLeft: 150,
  insetLeft: 50,
  x: {
    grid: true,
    ticks: "weeks",
    domain: x_domain,
    type: 'utc',
    axis: "top"
  },
  fy: {
    marginTop: 25,
    label: null,
    domain: fy_domain,
    tickSize: 0
  },
  marks: [
    Plot.dot(profileMatchesDF, Plot.dodgeY({
      x: 'sessionDate',
      fy: 'profile'
    }))
  ]
}))
```

```js
profilesDF
```
```js
profileMatchesDF
```
```js
profileBaseWithMatches
```
```js
teamMatches
```
```js
debuggingInfo
```

### Confetti

<!-- <img src="./img/cs2teamdedication/plaque.png"></img> -->
```js
// Importing confetti
import confetti from "npm:canvas-confetti";
```
```js
function createConfetti() {
  const out = html`<canvas width=400 style="position:fixed;display:box"></canvas>`
  const confet = confetti.create(out)
  const config = {
    origin: {
      y: 1,
      x: 0.4
    },
    startVelocity: 15,
    decay: 0.95
  }
  const button = Inputs.button("Throw confetti! 🎉", {reduce: () => setTimeout(() => confet(config),1000)})
  button.style = "width:fit-content;margin-left:auto;margin-right:auto;"
  return html`<div>${out}${button}</div>`
  return [out, button]
}

const conf1 = createConfetti();
const conf2 = createConfetti();
const conf3 = createConfetti();
const conf4 = createConfetti();

```
```js
// <!-- <div class="flex-container">
// <div class="flex-item">${conf1}</div>
//   <div class="flex-item">${conf1[1]}${conf1[0]} <div class="card">And this is it</div></div>
//   <div class="flex-item">${conf2[1]}${conf2[0]}</div>
//   <div class="flex-item">${conf3[1]}${conf3[0]}</div>
//   <div class="flex-item">${conf4[1]}${conf4[0]}</div>
//   <div class="flex-item">${conf5[1]}${conf5[0]}</div>
// <!-- </div> -->
```

<div class="grid grid-cols-4">
  <div class="card"><h1>A</h1></div>
  <div class="card"><h1>B</h1></div>
  <div class="card"><h1>C</h1></div>
  <div class="card"><h1>D</h1></div>
</div>



### Configurations

<div class="observablehq observablehq--block">${refdate_input}</div>
<div class="observablehq observablehq--block">${coloring_input}</div>
<div class="observablehq observablehq--block">${teamname_input}</div>
<div class="observablehq observablehq--block">${timeRange_input}</div>

<!-- BELOW ARE FEATURES CODE ONLY -->

<!-- ##### Source Data ##### -->

```js
const profileBaseWithMatches = FileAttachment("cs2teamdedication/data/data/profiles_matches.json").json();
const teamMatches = FileAttachment("cs2teamdedication/data/data/team_matches.json").json();
const debuggingInfo = FileAttachment("cs2teamdedication/data/data/infoForDebugging.json").json();
```

```js
// Enhancing profile features
const profilesDF = profileBaseWithMatches.map(profile => ({
  ...profile,
  sessionsPlayed: [...new Set(profile.games.filter(g => g.numTeamMembers > 1).map(g => g.sessionDate))],
  gameCountLast30days: profile.games.filter(f => isDateWithinRange(f.sessionDate, d3.utcDay.offset(today, -timeRange),today)).length,
  daysSinceLastGame: d3.timeDay.count(new Date(profile.games[0].sessionDate), today)

})).map(profile => ({
  ...profile,
  sessionStreak: profile.sessionsPlayed.reduce((acc, s, i) => {
    return s == teamSessions[i] && acc.onStreak ? {current: acc.current + 1, onStreak: true} : {current: acc.current, onStreak: false}
  }, {current: 0, onStreak: true}).current
}))


```
```js
// Generating profile-match DF
const profileMatchesDF = profilesDF.map(({name, id, avatar, recentRatings, personalBestsCS2, games}) => [
    ...games.map(game => ({
        profile: name,
        profileDetails: {id, avatar, recentRatings, personalBestsCS2},
        ...game
    }))
]).flat()
```

```js
// Team stats
const teamSessions = [...new Set(teamMatches.filter(g => g.numTeamMembers > 1).map(tm => tm.sessionDate))]
view(teamSessions)
```

```js
// Last session's player achievements

// const achievements = [
//   // General
//   {code: 'sessionStreak', fun: (gf) => gf[0].sessionStreak, bestIs: 'max', message: (name, metric) => `${name} has the highest streak, he/she played ${metric} sessions on a roll!`},
//   {code: 'highestPersonalPerformance', fun: (gf) => d3.max(gf, d => d.personalPerformanceRating), bestIs: 'max', message: (name, metric) => `${name} performed the best personally: ${d3.format('+.2f')(metric)}!`},
//   {code: 'aces', fun: (gf) => d3.sum(gf, d => d.multi5k), bestIs: 'max', message: (name, metric) => `${name} had the most Aces: ${metric}!`},
//   {code: 'MVPs', fun: (gf) => d3.sum(gf, d => d.mvps), bestIs: 'max', message: (name, metric) => `${name} had the most MVP rounds: ${metric}!`},
//   {code: 'assists', fun: (gf) => d3.sum(gf, d => d.totalAssists), bestIs: 'max', message: (name, metric) => `${name} made the most assists: ${metric}!`},
//   // Aim
//   {code: 'sprayAcc', fun: (gf) => d3.mean(gf, d => d.sprayAccuracy), bestIs: 'max', message: (name, metric) => `${name} had the best spray accuracy: ${d3.format('.0%')(metric)}!`},
//   {code: 'shotsFired', fun: (gf) => d3.sum(gf, d => d.shotsFired), bestIs: 'max', message: (name, metric) => `${name} fired the most shots: ${metric}!`},
//   {code: 'headShots', fun: (gf) => d3.sum(gf, d => d.accuracyHead * d.accuracy * d.shotsFired), bestIs: 'max', message: (name, metric) => `${name} shot heads the most: ${d3.format('.0f')(metric)} shots!`},
//   {code: 'friendlyShots', fun: (gf) => d3.sum(gf, d => d.shotsHitFriend), bestIs: 'max', message: (name, metric) => `${name} shot friends the most: ${metric} shots!`},
//   // Trades
//   {code: 'tradesPerc', fun: (gf) => d3.sum(gf, d => d.tradeKillsSucceeded + d.tradedDeathsSucceeded) / d3.sum(gf, d => d.tradeKillOpportunities + d.tradedDeathOpportunities), bestIs: 'max', message: (name, metric) => `${name} traded the most: ${d3.format('.0%')(metric)} of kills and deaths!`},
//   {code: 'tradeKillAttempts', fun: (gf) => d3.sum(gf, d => d.tradeKillAttempts), bestIs: 'max', message: (name, metric) => `${name} made the most traded kills: ${metric}!`},
//   {code: 'tradedDeathAttempts', fun: (gf) => d3.sum(gf, d => d.tradedDeathAttempts), bestIs: 'max', message: (name, metric) => `${name} had the most traded deaths: ${metric}!`},
//   // Utility
//   {code: 'unusedUtility', fun: (gf) => d3.sum(gf, d => d.utilityOnDeathAvg * d.totalDeaths), bestIs: 'max', message: (name, metric) => `${name} spent the most in unused utility: ${d3.format('$,.0f')(metric)}!`},
//   {code: 'smokesThrown', fun: (gf) => d3.sum(gf, d => d.smokeThrown), bestIs: 'max', message: (name, metric) => `${name} smoked the most: ${metric} smokes!`},
//   {code: 'goodCTSmokesThrown', fun: (gf) => d3.sum(gf, d => d.smokeThrownCTGood), bestIs: 'max', message: (name, metric) => `${name} threw good CT smokes the most: ${metric}!`},

//   {code: 'molotovThrown', fun: (gf) => d3.sum(gf, d => d.molotovThrown), bestIs: 'max', message: (name, metric) => `${name} mollied the most: ${metric} molotovs!`},
//   {code: 'molotovFoesDamage', fun: (gf) => d3.sum(gf, d => d.molotovFoesDamageAvg * d.molotovThrown), bestIs: 'max', message: (name, metric) => `${name} burned the most enemies: ${metric} damage!`},
//   {code: 'molotovFriendsDamage', fun: (gf) => d3.sum(gf, d => d.molotovFriendsDamageAvg * d.molotovThrown), bestIs: 'max', message: (name, metric) => `${name} burned the most friends: ${d3.format('.0f')(metric)} damage!`},

//   {code: 'heThrown', fun: (gf) => d3.sum(gf, d => d.heThrown), bestIs: 'max', message: (name, metric) => `${name} threw the most pokeballs: ${metric} HEs!`},
//   {code: 'heFoesDamageAvg', fun: (gf) => d3.sum(gf, d => d.heFoesDamageAvg * d.heThrown), bestIs: 'max', message: (name, metric) => `${name} damaged the most enemies with HEs: ${d3.format('.0f')(metric)} damage!`},
//   {code: 'heFriendsDamageAvg', fun: (gf) => d3.sum(gf, d => d.heFriendsDamageAvg * d.heThrown), bestIs: 'max', message: (name, metric) => `${name} damaged the most friends with HEs: ${d3.format('.0f')(metric)}!`},

//   {code: 'flashbangThrown', fun: (gf) => d3.sum(gf, d => d.flashbangThrown), bestIs: 'max', message: (name, metric) => `${name} banged the most: ${metric} flashbangs!`},
//   {code: 'flashbangHitFoeDuration', fun: (gf) => d3.sum(gf, d => d.flashbangHitFoe * d.flashbangHitFoeAvgDuration), bestIs: 'max', message: (name, metric) => `${name} blinded enemies for the longes time: ${d3.format('.0f')(metric)} seconds!`},
//   {code: 'flashbangHitFriend', fun: (gf) => d3.sum(gf, d => d.flashbangHitFriend), bestIs: 'max', message: (name, metric) => `${name} banged friends the most: ${metric} flashbangs!`},
// ]

// const bestIsDict = {
//   max: d3.maxIndex,
// }

// function getSessionTeamStats(session) {

//   // Calculating metrics upon which the achievements will be based
//   const calculatedMetricsProfiles = profilesDF.map(({name, avatar, sessionStreak, games}) => ({
//         name,
//         avatar,
//         sessionStreak,
//         lastSessionGamesFeats: games.filter(f => f.sessionDate == session).map(g => ({...g.profilePlayerStats, sessionStreak})),
//       })).filter( f => f.lastSessionGamesFeats.length > 0).map(({name, avatar, sessionStreak, lastSessionGamesFeats : gf}) => ({
//         name,
//         avatar,
//         ...Object.assign({},...achievements.map(({code, fun}) => ({[code]: fun(gf)}))),
//         // Base stats
//         lastSessionGamesFeats: gf,
//       }))
  
//   // Finding the achievers (best) for each achievement
//   const sessionAchievers = achievements.map(({code, message, bestIs}) => {
//     const winner = calculatedMetricsProfiles[bestIsDict[bestIs](calculatedMetricsProfiles, d => d[code])];

//     return {
//         profile: winner.name,
//         message: message(winner.name, winner[code])
//       }
//   });

//   // Listing achievements per profile that was active in the session
//   const profileAchievements = calculatedMetricsProfiles.map(({name, avatar}) => ({
//     name,
//     avatar,
//     achievements: sessionAchievers.filter(f => f.profile == name)
//   })).map(p => ({
//     ...p,
//     // Just a quick fix if it had no achievements
//     achievements: p.achievements.length > 0 ? p.achievements : [`${p.name} achieved nothing this session!`]
//   }))

//   return {calculatedMetricsProfiles, sessionAchievers, profileAchievements, z: sessionAchievers.map(sa => sa.message)}
// }

// view(getSessionTeamStats(teamSessions[0]))
```

<!-- ##### INPUTS ##### -->
```js
// Reference date
const refdate_input = Inputs.date({
  label: "Today is",
  value: new Date()
})
const refdate = Generators.input(refdate_input)
```

```js
const coloring_input = Inputs.radio(
  ["Week Streak", "Win/Loss", "Overall Perf.", "Personal Perf.", "Map"],
  { label: "Coloring", value: "Week Streak" }
)
const coloring = Generators.input(coloring_input)
```

```js
//// Team Name
const teamname_input = Inputs.text({ label: "Team name", value: "Sauna Gamer" })
const teamname = Generators.input(teamname_input)
```

```js
//// Time Range
const timeRange_input = Inputs.range([35, 140], {
  label: "Up to X days ago",
  step: 7,
  value: 70
})
const timeRange = Generators.input(timeRange_input)
```

<!-- ##### AUX ##### -->
```js
const todayIsSelected = d3.timeFormat("%Y-%m-%d")(refdate) ==
  d3.timeFormat("%Y-%m-%d")(d3.utcDay.offset(new Date(), -1))

const today = new Date(
  `${d3.timeFormat("%Y-%m-%d")(d3.utcDay.offset(refdate, 1))} 00:00:00`
)
```
<!-- Functions -->
```js
function getWeekStreak(gameDates) {
  const weeksAgoArray = gameDates.map(
    (g) => getWeeksAgo(g)
  );
  const currentStreak =
    weeksAgoArray.reduce((acc, cur) => (cur - acc <= 1 ? cur : acc), -1) + 1;

  return currentStreak;
}

function getDaysdata(gamesdata) {
  const daysdata_raw = d3.flatRollup(
    gamesdata,
    (v) => v.length,
    (d) => d.profile,
    (d) => d.gamedate
  );

  return daysdata_raw.map((d) => ({
    profile: d[0],
    date: d[1],
    games: d[2],
    weeksAgo: getWeeksAgo(d[1])
  }));
}

function getWeeksAgo(date) {
    return Math.floor(d3.timeDay.count(new Date(date), today) / 7)
}

function isDateWithinRange(dateToCheck, startDate, endDate) {
  // Ensure dates are converted to Date objects
  const date = new Date(dateToCheck);
  const start = new Date(startDate);
  const end = new Date(endDate);

  return date >= start && date <= end;
}
```