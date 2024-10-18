---
title: CS2 Team Dedication Report v2
toc: false
style: /cs2teamdedication/style.css
---

# ${teamname}
_CS2 Team Dedication Performance Report_

### Achievements last session
<div class='cell'>${achievementsSession(_.shuffle(profileAchievements), width)}</div>
<div class="observablehq observablehq--block">${selectedSession_input}</div>

### Calendar

```js

const calendarData = d3.sort(teamMatches, (a,b) => d3.ascending(a.sessionDate,b.sessionDate))
                      .map(d => ({...d, Date: new Date(d.sessionDate)}))

const calendarGraph = Plot.plot({
    height: 500,
    // width,
    x: { grid:true},
    y: {tickFormat: Plot.formatWeekday("PT-br"), tickSize: 0, grid:true},
    fy: {tickFormat: ""},
    color: {
        legend: true,
        type: 'categorical'
    },
    marks: [
        Plot.cell(calendarData,Plot.group({fill:'count'},{
            x: (d) => d3.utcWeek.count(d3.utcYear(d.Date), d.Date),
            y: (d) => d.Date.getUTCDay(),
            fy: (d) => d.Date.getUTCFullYear(),
            // fill: d => d.,
            // fill: (d, i) => i > 0 ? (d.Close - dji[i - 1].Close) / dji[i - 1].Close : NaN,
            // title: (d, i) => i > 0 ? ((d.Close - dji[i - 1].Close) / dji[i - 1].Close * 100).toFixed(1) : NaN,
            inset: 0.5
        }))
    ]
})

const start = d3.utcDay.offset(d3.min(calendarData, (d) => d.Date)); // exclusive
const end = d3.utcDay.offset(d3.max(calendarData, (d) => d.Date)); // exclusive

function calendar({
  date = Plot.identity,
  inset = 0.5,
  ...options
} = {}) {
  let D;
  return {
    fy: {transform: (data) => (D = Plot.valueof(data, date, Array)).map((d) => d.getUTCFullYear())},
    x: {transform: () => D.map((d) => d3.utcWeek.count(d3.utcYear(d), d))},
    y: {transform: () => D.map((d) => d.getUTCDay())},
    inset,
    ...options
  };
}

class MonthLine extends Plot.Mark {
  static defaults = {stroke: "currentColor", strokeWidth: 1};
  constructor(data, options = {}) {
    const {x, y} = options;
    super(data, {x: {value: x, scale: "x"}, y: {value: y, scale: "y"}}, options, MonthLine.defaults);
  }
  render(index, {x, y}, {x: X, y: Y}, dimensions) {
    const {marginTop, marginBottom, height} = dimensions;
    const dx = x.bandwidth(), dy = y.bandwidth();
    return htl.svg`<path fill=none stroke=${this.stroke} stroke-width=${this.strokeWidth} d=${
      Array.from(index, (i) => `${Y[i] > marginTop + dy * 1.5 // is the first day a Monday?
          ? `M${X[i] + dx},${marginTop}V${Y[i]}h${-dx}` 
          : `M${X[i]},${marginTop}`}V${height - marginBottom}`)
        .join("")
    }>`;
  }
}

const calendarGraph2 =  Plot.plot({
    style: "rect{border-radius:50%;}",
    width,
    height: d3.utcYear.count(start, end) * 200,
    axis: null,
    padding: 0,
    x: {
      domain: d3.range(54) // or 54, if showing weekends
    },
    y: {
      axis: "left",
      domain: [-1, 0, 1, 2, 3, 4, 5, 6], // hide 0 and 6 (weekends); use -1 for labels
      ticks: [0, 1, 2, 3, 4, 5, 6], // don’t draw a tick for -1
      tickSize: 0,
      tickFormat: Plot.formatWeekday()
    },
    fy: {
      padding: 0.1,
      reverse: true
    },
    color: {
    //   scheme: "piyg",
    //   domain: [-6, 6],
    transform: d => d <= 5 ? `${d}` : `6+`,
      legend: true,
      type: 'ordinal',
      scheme: 'BuGn',
      domain: [..._.range(-3,5).map(d => `${d}`),`6+`]
    //   percent: true,
    //   ticks: 6,
    //   tickFormat: "+d",
    //   label: "Daily change (%)"
    },
    marks: [
      // Draw year labels, rounding down to draw a year even if the data doesn’t
      // start on January 1. Use y = -1 (i.e., above Sunday) to align the year
      // labels vertically with the month labels, and shift them left to align
      // them horizontally with the weekday labels.
      Plot.text(
        d3.utcYears(d3.utcYear(start), end),
        calendar({text: d3.utcFormat("%Y"), frameAnchor: "right", x: 0, y: -1, dx: -20})
      ),

      // Draw month labels at the start of each month, rounding down to draw a
      // month even if the data doesn’t start on the first of the month. As
      // above, use y = -1 to place the month labels above the cells. (If you
      // want to show weekends, round up to Sunday instead of Monday.)
      Plot.text(
        d3.utcMonths(d3.utcMonth(start), end).map(d3.utcMonday.ceil),
        calendar({text: d3.utcFormat("%b"), frameAnchor: "left", y: -1})
      ),

      // Draw a cell for each day in our dataset. The color of the cell encodes
      // the relative daily change. (The first value is not defined because by
      // definition we don’t have the previous day’s close.)
      Plot.cell(
        calendarData,
        Plot.group({fill:'count'},{
        ...calendar({date: "Date"})})
      ),

      // Draw a line delineating adjacent months. Since the y-domain above is
      // set to hide weekends (day number 0 = Sunday and 6 = Saturday), if the
      // first day of the month is a weekend, round up to the first monday.
      new MonthLine(
        d3.utcMonths(d3.utcMonth(start), end),
        calendar({stroke: "darkgrey", strokeWidth: 1, strokeDasharray: '4,2'}) 
      ),

      // Lastly, draw the date for all days spanning the dataset, including
      // days for which there is no data.
      Plot.text(
        d3.utcDays(start, end),
        {...calendar({text: d3.utcFormat("%-d")}), opacity: 0.2}
      ),
      Plot.text(
        calendarData,
        {...calendar({text: d => d3.utcFormat("%-d")(d.Date), date: "Date",...Plot.selectFirst({z:'Date'})}), opacity: 1, fill: 'white', fontWeight: 'bold'}
      )
    ]
  });


view(calendarGraph2)
```

### Historical Timeline

```js
import { timelineGraph } from './cs2teamdedication/timelineGraph.js';

```
```js
resize((width) => timelineGraph(profileMatchesDF, profilesDF, today, timeRange, width))
```

<div class="observablehq observablehq--block">${refdate_input}</div>
<div class="observablehq observablehq--block">${coloring_input}</div>
<div class="observablehq observablehq--block">${teamname_input}</div>
<div class="observablehq observablehq--block">${timeRange_input}</div>

```js
// Importing confetti
import confetti from "npm:canvas-confetti";
import _ from "npm:lodash";
```

```js
function achievementsSession(profileAchievements, width) {
    return html`<div class='flex-container'>
        ${profileAchievements.map((pa,i) => achievementBlock(pa, width/profileAchievements.length,i ))}
    </div>`
}

function achievementBlock(profile, blockWidth, i) {

    const imgheight = 80
    const confetti_canvas = html`<canvas width='${blockWidth}' height='${imgheight*2.5}' style="position:absolute;left:0px;right:0px;top:${-imgheight*(0.4 + 0.5)}px;display:box;margin:0 auto;" id="${profile.name}-${i}-canvas"></canvas>`

    const confet = confetti.create(confetti_canvas)
    const config = {
        origin: {
        y: 1,
        },
        startVelocity: 15,
        decay: 0.95
    }

    let highlightedAchievement = _.sample(profile.achievements.map(a => a.message));

    function refresh() {
        const caption = document.getElementById(`${profile.name}-${i}-achievement`)
        highlightedAchievement = _.sample(profile.achievements.map(a => a.message));

        caption.innerText = '...🥁...';

        setTimeout(() => {
            caption.innerText = highlightedAchievement;
        },800);
        setTimeout(() => {
            confet(config);
        },1000);
    }

    const mostfrequentcolor = _.head(_.maxBy(_.toPairs(_.countBy(profile.colors)), (pair) => pair[1]))

    const imgblock = html`<figure style="position:relative;inset:0; margin:0;">
                                <img 
                                    class="avatar c${mostfrequentcolor}"
                                    src="${profile.avatar}" 
                                    width="${imgheight}" 
                                />
                                <figcaption id='${profile.name}-${i}-achievement' style="min-height:4rem;display: flex;justify-content: center;align-items: center;">
                                ${highlightedAchievement}
                                </figcaption></figure>`

    const button = Inputs.button("What else?", {reduce: () => refresh()})
    button.style = "width:fit-content;margin:0 auto;"
    return html`<div class='flex-item' style="position:relative;">${imgblock}<div style="display:flex;flex-grow:1;align-items:center;">${button}${confetti_canvas}</div></div>`

}
```



#### Data Debugger

```js
{profileBaseWithMatches, teamMatches, debuggingInfo, profileMatchesDF, profileBaseWithMatches, profilesDF, ...sessionData, teamSessions}
```


<!-- ##### Source Data ##### -->

```js
const profileBaseWithMatches = FileAttachment("cs2teamdedication/data/data/profiles_matches.json").json();
const teamMatches = FileAttachment("cs2teamdedication/data/data/team_matches.json").json();
const debuggingInfo = FileAttachment("cs2teamdedication/data/data/infoForDebugging.json").json();
const rawProfiles = FileAttachment("cs2teamdedication/data/data/raw_profiles.json").json();
const rawMatches = FileAttachment("cs2teamdedication/data/data/raw_matches.json").json();
```

```js
rawProfiles
```
```js
rawMatches
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
```

```js
// Last session's player achievements

const achievements = [
  // General
  {code: 'sessionStreak', fun: (gf) => gf[0].sessionStreak, bestIs: 'max', message: (name, metric) => `${name} has the highest streak, he/she played ${metric} sessions on a roll!`},
  {code: 'highestPersonalPerformance', fun: (gf) => d3.max(gf, d => d.personalPerformanceRating), bestIs: 'max', message: (name, metric) => `${name} performed the best personally: ${d3.format('+.2f')(metric)}!`},
  {code: 'aces', fun: (gf) => d3.sum(gf, d => d.multi5k), bestIs: 'max', message: (name, metric) => `${name} had the most Aces: ${metric}!`},
  {code: 'MVPs', fun: (gf) => d3.sum(gf, d => d.mvps), bestIs: 'max', message: (name, metric) => `${name} had the most MVP rounds: ${metric}!`},
  {code: 'assists', fun: (gf) => d3.sum(gf, d => d.totalAssists), bestIs: 'max', message: (name, metric) => `${name} made the most assists: ${metric}!`},
  // Aim
  {code: 'sprayAcc', fun: (gf) => d3.mean(gf, d => d.sprayAccuracy), bestIs: 'max', message: (name, metric) => `${name} had the best spray accuracy: ${d3.format('.0%')(metric)}!`},
  {code: 'shotsFired', fun: (gf) => d3.sum(gf, d => d.shotsFired), bestIs: 'max', message: (name, metric) => `${name} fired the most shots: ${metric}!`},
  {code: 'headShots', fun: (gf) => d3.sum(gf, d => d.accuracyHead * d.accuracy * d.shotsFired), bestIs: 'max', message: (name, metric) => `${name} shot heads the most: ${d3.format('.0f')(metric)} shots!`},
  {code: 'friendlyShots', fun: (gf) => d3.sum(gf, d => d.shotsHitFriend), bestIs: 'max', message: (name, metric) => `${name} shot friends the most: ${metric} shots!`},
  // Trades
  {code: 'tradesPerc', fun: (gf) => d3.sum(gf, d => d.tradeKillsSucceeded + d.tradedDeathsSucceeded) / d3.sum(gf, d => d.tradeKillOpportunities + d.tradedDeathOpportunities), bestIs: 'max', message: (name, metric) => `${name} traded the most: ${d3.format('.0%')(metric)} of kills and deaths!`},
  {code: 'tradeKillAttempts', fun: (gf) => d3.sum(gf, d => d.tradeKillAttempts), bestIs: 'max', message: (name, metric) => `${name} made the most traded kills: ${metric}!`},
  {code: 'tradedDeathAttempts', fun: (gf) => d3.sum(gf, d => d.tradedDeathAttempts), bestIs: 'max', message: (name, metric) => `${name} had the most traded deaths: ${metric}!`},
  // Utility
  {code: 'unusedUtility', fun: (gf) => d3.sum(gf, d => d.utilityOnDeathAvg * d.totalDeaths), bestIs: 'max', message: (name, metric) => `${name} spent the most in unused utility: ${d3.format('$,.0f')(metric)}!`},
  {code: 'smokesThrown', fun: (gf) => d3.sum(gf, d => d.smokeThrown), bestIs: 'max', message: (name, metric) => `${name} smoked the most: ${metric} smokes!`},
  {code: 'goodCTSmokesThrown', fun: (gf) => d3.sum(gf, d => d.smokeThrownCTGood), bestIs: 'max', message: (name, metric) => `${name} threw good CT smokes the most: ${metric}!`},

  {code: 'molotovThrown', fun: (gf) => d3.sum(gf, d => d.molotovThrown), bestIs: 'max', message: (name, metric) => `${name} mollied the most: ${metric} molotovs!`},
  {code: 'molotovFoesDamage', fun: (gf) => d3.sum(gf, d => d.molotovFoesDamageAvg * d.molotovThrown), bestIs: 'max', message: (name, metric) => `${name} burned enemies the most: ${d3.format('.0f')(metric)} damage!`},
  {code: 'molotovFriendsDamage', fun: (gf) => d3.sum(gf, d => d.molotovFriendsDamageAvg * d.molotovThrown), bestIs: 'max', message: (name, metric) => `${name} burned friends the most: ${d3.format('.0f')(metric)} damage!`},

  {code: 'heThrown', fun: (gf) => d3.sum(gf, d => d.heThrown), bestIs: 'max', message: (name, metric) => `${name} threw the most pokeballs: ${metric} HEs!`},
  {code: 'heFoesDamageAvg', fun: (gf) => d3.sum(gf, d => d.heFoesDamageAvg * d.heThrown), bestIs: 'max', message: (name, metric) => `${name} damaged the most enemies with HEs: ${d3.format('.0f')(metric)} damage!`},
  {code: 'heFriendsDamageAvg', fun: (gf) => d3.sum(gf, d => d.heFriendsDamageAvg * d.heThrown), bestIs: 'max', message: (name, metric) => `${name} damaged the most friends with HEs: ${d3.format('.0f')(metric)}!`},

  {code: 'flashbangThrown', fun: (gf) => d3.sum(gf, d => d.flashbangThrown), bestIs: 'max', message: (name, metric) => `${name} banged the most: ${metric} flashbangs!`},
  {code: 'flashbangHitFoeDuration', fun: (gf) => d3.sum(gf, d => d.flashbangHitFoe * d.flashbangHitFoeAvgDuration), bestIs: 'max', message: (name, metric) => `${name} blinded enemies for the longes time: ${d3.format('.0f')(metric)} seconds!`},
  {code: 'flashbangHitFriend', fun: (gf) => d3.sum(gf, d => d.flashbangHitFriend), bestIs: 'max', message: (name, metric) => `${name} banged friends the most: ${metric} flashbangs!`},
]

const bestIsDict = {
  max: d3.maxIndex,
}

function getSessionTeamStats(session) {

  // Calculating metrics upon which the achievements will be based
  const calculatedMetricsProfiles = profilesDF.map(({name, avatar, sessionStreak, games}) => ({
        name,
        avatar,
        sessionStreak,
        lastSessionGamesFeats: games.filter(f => f.sessionDate == session).map(g => ({...g.profilePlayerStats, sessionStreak})),
      })).filter( f => f.lastSessionGamesFeats.length > 0).map(({name, avatar, sessionStreak, lastSessionGamesFeats : gf}) => ({
        name,
        avatar,
        ...Object.assign({},...achievements.map(({code, fun}) => ({[code]: fun(gf)}))),
        // Base stats
        lastSessionGamesFeats: gf,
      }))
  
  // Finding the achievers (best) for each achievement
  const sessionAchievers = achievements.map(({code, message, bestIs}) => {
    const winner = calculatedMetricsProfiles[bestIsDict[bestIs](calculatedMetricsProfiles, d => d[code])];

    return {
        achievement: code,
        profile: winner.name,
        message: message(winner.name, winner[code]),
        metric: winner[code]
      }
  });

  // Listing achievements per profile that was active in the session
  const profileAchievements = calculatedMetricsProfiles.map(({name, avatar, lastSessionGamesFeats}) => ({
    name,
    avatar,
    colors: lastSessionGamesFeats.map(g => g.color),
    achievements: sessionAchievers.filter(f => f.profile == name)
  })).map(p => ({
    ...p,
    // Just a quick fix if it had no achievements
    achievements: p.achievements.length > 0 ? p.achievements : [`${p.name} achieved nothing this session!`]
  }))

  return {calculatedMetricsProfiles, sessionAchievers, profileAchievements, achievementMessages: sessionAchievers.map(sa => sa.message)}
}
const sessionData = getSessionTeamStats(selectedSession);
const {profileAchievements} = sessionData
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
```js
//// Session for stats
const selectedSession_input = Inputs.select(
  teamSessions,
  { label: "Session", value: teamSessions[0] }
)
const selectedSession = Generators.input(selectedSession_input)

```

<!-- ##### AUX ##### -->
```js
const todayIsSelected = d3.timeFormat("%Y-%m-%d")(refdate) ==
  d3.timeFormat("%Y-%m-%d")(d3.utcDay.offset(new Date(), -1))

const today = new Date(
  `${d3.timeFormat("%Y-%m-%d")(d3.utcDay.offset(refdate, 1))} 00:00:00`
)
```
<!-- Aux Functions -->
```js
import { getWeekStreak, getDaysdata, getWeeksAgo, isDateWithinRange } from './cs2teamdedication/auxFunctions.js';
```