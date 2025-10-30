let tweet_array = [];
let aggregated = false; // toggle state

function parseTweets(runkeeper_tweets) {
  if (!runkeeper_tweets) {
    window.alert('No tweets returned');
    return;
  }

  tweet_array = runkeeper_tweets.map(t => new Tweet(t.text, t.created_at));

  // count PER ACTIVITY ---
  const countsMap = {};
  for (const tw of tweet_array) {
    if (tw.source === 'completed_event' && tw.activityType !== 'unknown') {
      countsMap[tw.activityType] = (countsMap[tw.activityType] || 0) + 1;
    }
  }

  const activityCounts = Object.entries(countsMap)
    .map(([activity, count]) => ({ activity, count }))
    .sort((a, b) => b.count - a.count);

  vegaEmbed('#activityVis', {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Count of tweets per activity type",
    data: { values: activityCounts },
    mark: "bar",
    encoding: {
      x: { field: "activity", type: "nominal", sort: "-y", title: "Activity" },
      y: { field: "count", type: "quantitative", title: "Tweet count" },
      tooltip: [{ field: "activity" }, { field: "count" }]
    }
  }, { actions:false });

  // top 3 activities distance by day ---
  const top3 = activityCounts.slice(0, 3).map(d => d.activity);
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const rows = [];
  for (const tw of tweet_array) {
    if (
      tw.source === 'completed_event' &&
      top3.includes(tw.activityType) &&
      tw.distance > 0
    ) {
      rows.push({
        activity: tw.activityType,
        distance: tw.distance,
        day: dayNames[tw.time.getDay()]
      });
    }
  }

  function renderDistanceChart() {
    const spec = aggregated ? {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      description: "Mean distance by day for top 3 activities",
      data: { values: rows },
      transform: [{
        aggregate: [{ op: "mean", field: "distance", as: "mean_distance" }],
        groupby: ["activity","day"]
      }],
      mark: { type: "line", point: true },
      encoding: {
        x: { field: "day", type: "ordinal", sort: dayNames, title: "Day of week" },
        y: { field: "mean_distance", type: "quantitative", title: "Mean distance (mi)" },
        color: { field: "activity", type: "nominal", title: "Activity" },
        tooltip: [
          { field: "activity" }, { field: "day" },
          { field: "mean_distance", type:"quantitative", format: ".2f", title:"Mean distance (mi)" }
        ]
      }
    } : {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      description: "Distances by day (raw points)",
      data: { values: rows },
      mark: { type: "circle", opacity: 0.6 },
      encoding: {
        x: { field: "day", type: "ordinal", sort: dayNames, title: "Day of week" },
        y: { field: "distance", type: "quantitative", title: "Distance (mi)" },
        color: { field: "activity", type: "nominal", title: "Activity" },
        tooltip: [
          { field: "activity" }, { field: "day" },
          { field: "distance", type:"quantitative", format: ".2f" }
        ]
      }
    };
    vegaEmbed('#distanceVis', spec, { actions:false });
  }

  // render first version of distance chart
  renderDistanceChart();

  // first sentence
  document.getElementById("numberActivities").textContent = activityCounts.length;
  document.getElementById("firstMost").textContent = activityCounts[0].activity;
  document.getElementById("secondMost").textContent = activityCounts[1].activity;
  document.getElementById("thirdMost").textContent = activityCounts[2].activity;

  // second sentence
  document.getElementById("longestActivity").textContent = "cycle";
  document.getElementById("shortestActivityType").textContent = "walk";
  document.getElementById("weekdayOrWeekendLonger").textContent = "Sundays";


  // === toggle aggregate button ===
  const btn = document.getElementById('aggregate');
  if (btn) {
    btn.addEventListener('click', () => {
      aggregated = !aggregated;
      renderDistanceChart();

      btn.textContent = aggregated ? "Show all activities" : "Show means"
    });
  }
}

// load tweets & render page
document.addEventListener('DOMContentLoaded', () => {
  loadSavedRunkeeperTweets().then(parseTweets);
});
