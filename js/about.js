let tweet_array = [];

function parseTweets(runkeeper_tweets) {
    if(!runkeeper_tweets) {
        window.alert('No tweets returned');
        return;
    }

    tweet_array = runkeeper_tweets.map(t => new Tweet(t.text, t.created_at));

    // total count
    document.getElementById('numberTweets').innerText = tweet_array.length;

    // earliest + latest Date
    const sorted = [...tweet_array].sort((a,b) => a.time.getTime() - b.time.getTime());

    const fmt = { weekday:"long", year:"numeric", month:"long", day:"numeric" };
    document.getElementById('firstDate').innerText = sorted[0].time.toLocaleDateString("en-US", fmt);
    document.getElementById('lastDate').innerText  = sorted[sorted.length-1].time.toLocaleDateString("en-US", fmt);

    // category counts
    let completed = 0, live = 0, achieve = 0, misc = 0;
    let completedWithText = 0;

    for(const tw of tweet_array) {
        if(tw.source === "completed_event") {
            completed++;
            if(tw.written) completedWithText++;
        }
        else if(tw.source === "live_event") live++;
        else if(tw.source === "achievement") achieve++;
        else misc++;
    }

    const total = tweet_array.length;
    const pct = (x, y = total) => ((x / y) * 100).toFixed(2) + "%";

    document.querySelectorAll(".completedEvents").forEach(el => el.textContent = completed);
    document.querySelectorAll(".completedEventsPct").forEach(el => el.textContent = pct(completed));

    document.querySelectorAll(".liveEvents").forEach(el => el.textContent = live);
    document.querySelectorAll(".liveEventsPct").forEach(el => el.textContent = pct(live));

    document.querySelectorAll(".achievements").forEach(el => el.textContent = achieve);
    document.querySelectorAll(".achievementsPct").forEach(el => el.textContent = pct(achieve));

    document.querySelectorAll(".miscellaneous").forEach(el => el.textContent = misc);
    document.querySelectorAll(".miscellaneousPct").forEach(el => el.textContent = pct(misc));

    //  completed tweets
    document.querySelectorAll(".written").forEach(el => el.textContent = completedWithText);
    document.querySelectorAll(".writtenPct").forEach(el => el.textContent = pct(completedWithText, completed));
}

document.addEventListener('DOMContentLoaded', function () {
    loadSavedRunkeeperTweets().then(parseTweets);
});
