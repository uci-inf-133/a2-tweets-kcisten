"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Tweet {
    text;
    time;
    constructor(tweet_text, tweet_time) {
        this.text = tweet_text;
        this.time = new Date(tweet_time); //, "ddd MMM D HH:mm:ss Z YYYY"
    }
    //returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source() {
        //TODO: identify whether the source is a live event, an achievement, a completed event, or miscellaneous.
        return "unknown";
    }
    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written() {
        //TODO: identify whether the tweet is written
        return false;
    }
    get writtenText() {
        if (!this.written) {
            return "";
        }
        //TODO: parse the written text from the tweet
        return "";
    }
    get activityType() {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        //TODO: parse the activity type from the text of the tweet
        return "";
    }
    get distance() {
        if (this.source != 'completed_event') {
            return 0;
        }
        //TODO: prase the distance from the text of the tweet
        return 0;
    }
    getHTMLTableRow(rowNumber) {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        return "<tr></tr>";
    }
}
//# sourceMappingURL=tweet.js.map