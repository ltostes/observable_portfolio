import * as d3 from 'd3'

export function getWeekStreak(gameDates) {
    const weeksAgoArray = gameDates.map(
      (g) => getWeeksAgo(g)
    );
    const currentStreak =
      weeksAgoArray.reduce((acc, cur) => (cur - acc <= 1 ? cur : acc), -1) + 1;
  
    return currentStreak;
}
  
export function getDaysdata(gamesdata) {
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

export function getWeeksAgo(date) {
    return Math.floor(d3.timeDay.count(new Date(date), today) / 7)
}

export function isDateWithinRange(dateToCheck, startDate, endDate) {
    // Ensure dates are converted to Date objects
    const date = new Date(dateToCheck);
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    return date >= start && date <= end;
}