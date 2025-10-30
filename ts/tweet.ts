class Tweet {
  private text: string;
  time: Date;

  constructor(tweet_text: string, tweet_time: string) {
    this.text = tweet_text || "";
    this.time = new Date(tweet_time); // "Sun Sep 30 06:58:57 +0000 2018"
  }

  // -------- helpers -------
  private norm(s: string): string {
    return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  private stripUrlMentionsHashtags(s: string): string {
    return (s || "")
      .replace(/https?:\/\/\S+/gi, "")
      .replace(/@[a-z0-9_]+/gi, "")
      .replace(/#runkeeper/gi, "") // drop #RunKeeper
      .replace(/\s+/g, " ")
      .trim();
  }

  private removeBoilerplate(s: string): string {
    const stems = [
      "just completed a", "just completed an",
      "completed a", "completed an",
      "just posted a", "just posted an",
      "i just posted a", "just did a",
      "with runkeeper", "via runkeeper", "on runkeeper",
      "check it out", "check it out!"
    ];
    let t = " " + this.norm(s) + " ";
    for (const stem of stems) {
      const re = new RegExp("\\b" + stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "gi");
      t = t.replace(re, " ");
    }
    return t.replace(/\s+/g, " ").replace(/^\W+|\W+$/g, "").trim();
  }

  private firstUrl(): string | null {
    const m = this.text.match(/https?:\/\/\S+/i);
    return m ? m[0] : null;
  }

  private findActivityKeyword(): string {
    const t = this.norm(this.text);
    const activityKeywords: Array<[string, string[]]> = [
      ["running", ["run", "running"]],
      ["walking", ["walk", "walking"]],
      ["cycling", ["cycle", "cycling", "bike", "biking", "ride", "riding"]],
      ["hiking", ["hike", "hiking"]],
      ["swimming", ["swim", "swimming"]],
      ["rowing", ["row", "rowing"]],
      ["elliptical", ["elliptical"]],
      ["skiing", ["ski", "skiing"]],
      ["snowboarding", ["snowboard", "snowboarding"]],
      ["skating", ["skate", "skating", "rollerskate", "rollerblading", "rollerblade"]],
      ["kayaking", ["kayak", "kayaking"]],
      ["yoga", ["yoga"]],
      ["workout", ["workout", "gym", "crossfit", "strength"]]
    ];
    for (const [canonical, variants] of activityKeywords) {
      for (const v of variants) {
        const re = new RegExp(`\\b${v}\\b`, "i");
        if (re.test(t)) return canonical;
      }
    }
    return "unknown";
  }

  private escapeHtml(s: string): string {
    return (s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  private escapeHtmlExceptLinks(s: string): string {
    const placeholders: string[] = [];
    const masked = s.replace(/<a [^>]*>[^<]*<\/a>/gi, (m) => {
      placeholders.push(m);
      return `__A_PLACEHOLDER_${placeholders.length - 1}__`;
    });
    const escaped = this.escapeHtml(masked);
    return escaped.replace(/__A_PLACEHOLDER_(\d+)__/g, (_, i) => placeholders[+i]);
  }

  // ---- getters ----

  // 'live_event' | 'achievement' | 'completed_event' | 'miscellaneous'
  get source(): string {
    const t = this.norm(this.text);

    const isCompleted =
      /\bjust completed (a|an)\b/i.test(t) ||
      /\bcompleted (a|an)\b/i.test(t) ||
      /\bjust posted (a|an)\b/i.test(t) ||
      /\bjust did (a|an)\b/i.test(t);

    const isLive =
      /\bjust started\b/i.test(t) ||
      /\bi'm (?:running|walking|cycling|doing)\b/i.test(t); 

    const isAchievement =
      /\bachieved\b/i.test(t) ||
      /\bnew personal record\b/i.test(t) ||
      /\bprs?\b/i.test(t) ||
      /\bset (a|an) goal\b/i.test(t) ||
      (/\bgoal\b/i.test(t) && /\brunkeeper\b/i.test(t));

    if (isCompleted) return "completed_event";
    if (isAchievement) return "achievement";
    if (isLive) return "live_event";
    return "miscellaneous";
  }

  // whether the text includes any user-authored content
  get written(): boolean {
    const base = this.stripUrlMentionsHashtags(this.text);
    const remaining = this.removeBoilerplate(base);
    return /[a-z0-9]/i.test(remaining);
  }

  get writtenText(): string {
    if (!this.written) return "";

    const base = this.stripUrlMentionsHashtags(this.text);
    const remaining = this.removeBoilerplate(base);

    return remaining || "";
  }

  get activityType(): string {
    if (this.source !== "completed_event") return "unknown";
    return this.findActivityKeyword();
  }

  get distance(): number {
    if (this.source !== "completed_event") return 0;

    // e.g., "4.87 km", "1.89 mi"
    const m = this.text.match(/(\d+(?:\.\d+)?)\s*(mi|mile|miles|km|kilometer|kilometers)\b/i);
    if (!m) return 0;

    const value = parseFloat(m[1]);
    const unit = m[2].toLowerCase();
    if (["mi", "mile", "miles"].includes(unit)) return value;

    // km → mi
    const KM_TO_MI = 0.621371;
    return +(value * KM_TO_MI).toFixed(2);
  }

  getHTMLTableRow(rowNumber: number): string {
    // linkify URLs
    const linkified = this.text.replace(/https?:\/\/\S+/gi, (url) => {
      const safe = this.escapeHtml(url);
      return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${safe}</a>`;
    });

    const safeText = this.escapeHtmlExceptLinks(linkified);
    const type = this.activityType;

    return `<tr>
      <td>${rowNumber}</td>
      <td>${this.escapeHtml(type)}</td>
      <td>${safeText}</td>
    </tr>`;
  }
}
