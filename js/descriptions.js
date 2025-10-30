let writtenTweets = [];

function parseTweets(runkeeper_tweets) {
  if (!runkeeper_tweets) {
    window.alert('No tweets returned');
    return;
  }
  const all = runkeeper_tweets.map(t => new Tweet(t.text, t.created_at));
  writtenTweets = all.filter(tw => tw.written);

  // initialize UI
  document.getElementById('searchCount').textContent = "0";
  document.getElementById('searchText').textContent  = "";
  renderRows([]); 
}

function renderRows(tweets) {
  const tbody = document.getElementById('tweetTable');
  if (!tbody) return;

  // clear current rows
  tbody.textContent = "";

  // add rows
  let rowNum = 1;
  for (const tw of tweets) {

    tbody.insertAdjacentHTML('beforeend', tw.getHTMLTableRow(rowNum++));
  }
}

function addEventHandlerForSearch() {
  const input =
    document.getElementById('textFilter') ||
    document.querySelector('input[type="search"]') ||
    document.querySelector('input[type="text"]');

  if (!input) return;

  input.addEventListener('input', (e) => {
    const q = (e.target.value || "").toLowerCase().trim();

    if (!q) {
      document.getElementById('searchCount').textContent = "0";
      document.getElementById('searchText').textContent  = "";
      renderRows([]);
      return;
    }

    const matches = writtenTweets.filter(tw => {
      const a = (tw.writtenText || "").toLowerCase();
      const b = (tw['text'] || "").toLowerCase(); // fallback
      return a.includes(q) || b.includes(q);
    });

    document.getElementById('searchCount').textContent = String(matches.length);
    document.getElementById('searchText').textContent  = e.target.value;
    renderRows(matches);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  addEventHandlerForSearch();
  loadSavedRunkeeperTweets().then(parseTweets);
});
