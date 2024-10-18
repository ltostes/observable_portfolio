import * as Plot from "npm:@observablehq/plot";
import * as d3 from 'd3';

export function timelineGraph(profileMatchesDF, profilesDF, today, timeRange, width) {
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
    return Plot.plot({
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
    })
}