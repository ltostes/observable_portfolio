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
<div class="observablehq observablehq--block">${profileList_input}</div>
<div class="observablehq observablehq--block">${multiProfiles_input}</div>

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

```js
//// Profile List
const profileList_input = Inputs.textarea({
    label: "Profile List",
    submit: true,
    value: `76561198045239417: elTostes
76561199081589502: Rogerinho do Ingá
76561198072099800: Leandro, O Zébio
76561197988075974: Arret
76561197989969303: Terra
76561198030729173: Frefs
76561198019340968: Diogo
76561198178678687: Rust Cohle
76561199019347586: Cano Carequinha
76561198056952889: Pistoleiro do Sudoeste
76561198143606012: Ahaab Himself
76561199674847975: ilanvale`
});

const profileList_gen = Generators.observe(
    (notify) => {
        const inputted = () => notify(profileList_input.value);
        inputted();
        profileList_input.addEventListener("submit", inputted);
        return () => profileList_input.removeEventListener("submit", inputted)
    }
    )
```
```js
//// Profile List - Continuation
// (Processing list after async operations before)
const profileList = profileList_gen.split("\n").map(line => line.split(": ")[0])
```

```js
//// Multi-Profiles List
const multiProfiles_input = Inputs.textarea({
    label: "Profile List",
    submit: true,
    value: `Rogerinho do Ingá: elTostes
Arret: Terra`
});

const multiProfiles_gen = Generators.observe(
    (notify) => {
        const inputted = () => notify(multiProfiles_input.value);
        inputted();
        multiProfiles_input.addEventListener("submit", inputted);
        return () => multiProfiles_input.removeEventListener("submit", inputted)
    }
    )
```
```js
//// Multi-Profiles - Continuation
// (Processing list after async operations before)
const multiProfiles = multiProfiles_gen.split("\n").map(line => ({[line.split(": ")[0]] : line.split(": ")[1]}))
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