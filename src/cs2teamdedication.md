---
title: CS2 Team Dedication Report
toc: false
---

# ${teamname}
#### _CS2 Team Dedication Performance Report_

```js
Plot.dotX([1,2,3,4,5]).plot()
```

```js
const profiles = FileAttachment("data/cs2teamdedication/data/profiles.json").json();
const matches = FileAttachment("data/cs2teamdedication/data/matches.json").json();
const retrievalInfo = FileAttachment("data/cs2teamdedication/data/retrievalinfo.json").json();
```

```js
profiles
```
```js
matches
```
```js
retrievalInfo
```

### Configurations

<div class="observablehq observablehq--block">${refdate_input}</div>
<div class="observablehq observablehq--block">${coloring_input}</div>
<div class="observablehq observablehq--block">${teamname_input}</div>
<div class="observablehq observablehq--block">${timeRange_input}</div>

<!-- BELOW ARE FEATURES CODE ONLY -->

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