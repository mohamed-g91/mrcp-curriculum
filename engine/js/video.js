/* ---------- video: Learn on the candidate's page ----------
   The poster stands in for the player, so nothing loads from YouTube (and no cookie is set)
   until the video is asked for. The poster starts it at 0:00, a chapter at its own time; once
   the player is in, a chapter seeks it instead. Leaving the slide pauses it. */
const YT_ORIGIN = "https://www.youtube-nocookie.com";
function buildVideo() {
  const box = $(".vid-player");
  if (!box || !box.dataset.video) return;
  let frame = null;
  const say = (func, args = []) => frame && frame.contentWindow.postMessage(JSON.stringify({ event: "command", func, args }), YT_ORIGIN);
  const play = at => {
    record("play", { topic: TOPIC.id, at });
    if (frame) { say("seekTo", [at, true]); say("playVideo"); return; }
    frame = el("iframe", {
      src: `${YT_ORIGIN}/embed/${encodeURIComponent(box.dataset.video)}?autoplay=1&rel=0&playsinline=1&enablejsapi=1&start=${at}`,
      title: TOPIC.title, allow: "autoplay; encrypted-media; picture-in-picture; fullscreen",
      allowfullscreen: "", referrerpolicy: "strict-origin-when-cross-origin",
    });
    box.replaceChildren(frame);
  };
  $(".vid-poster", box).addEventListener("click", () => play(0));
  $$(".vid-ch[data-at]").forEach(b => b.addEventListener("click", () => {
    $$(".vid-ch.on").forEach(x => x.classList.remove("on"));
    b.classList.add("on");
    play(+b.dataset.at);
  }));
  box.closest(".slide").addEventListener("slideleave", () => say("pauseVideo"));
}
