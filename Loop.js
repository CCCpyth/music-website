!async function main() { "use strict";
    const dom = {
        lyric: document.querySelector(".lyric"),
        player: document.querySelector(".control")
    };

    // load lrc file
    const res = await fetch("https://raw.githubusercontent.com/CCCpyth/music-website/main/media/Loop.lrc");
    const lrc = await res.text();
    const lyrics = parseLyric(lrc);

    dom.player.src =  "media/loop.mp3";

    dom.player.ontimeupdate = () => {
        const time = dom.player.currentTime;
        const index = syncLyric(lyrics, time);

        if (index == null) return;

        dom.lyric.innerHTML = lyrics[index].text;
    };

}();

// lrc (String) - lrc file text
function parseLyric(lrc) {
    // will match "[00:00.00] ooooh yeah!"
    // note: i use named capturing group
    const regex = /^\[(?<time>\d{2}:\d{2}(.\d{2})?)\](?<text>.*)/;

    // split lrc string to individual lines
    const lines = lrc.split("\n");

    const output = [];

    lines.forEach(line => {
        const matches = line.match(regex);

        // if doesn't match, return.
        if (matches == null) return;

        const { time, text } = matches.groups;

        output.push({
            time: parseTime(time),
            text: text.trim()
        });
    });

    // parse formated time
    // "03:24.73" => 204.73 (total time in seconds)
    function parseTime(time) {
        const minsec = time.split(":");

        const min = parseInt(minsec[0]) * 60;
        const sec = parseFloat(minsec[1]);

        return min + sec-0.5;
    }

    return output;
}

// lyrics (Array) - output from parseLyric function
// time (Number) - current time from audio player
function syncLyric(lyrics, time) {
    const scores = [];

    lyrics.forEach(lyric => {
        // get the gap or distance or we call it score
        const score = time - lyric.time;

        // we don't want a negative score
        if (score >= 0) scores.push(score);
    });

    if (scores.length == 0) return null;

    // get the smallest value from scores
    const closest = Math.min(...scores);

    // return the index of closest lyric
    return scores.indexOf(closest);
}