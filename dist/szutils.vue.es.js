import { reactive as y, computed as o } from "vue";
import { Duration as a } from "luxon";
function M(e = { hours: 0, minutes: 0, seconds: 0 }) {
  const s = y({
    raw: a.fromObject(e)
  }), t = o(
    () => s.raw.shiftTo("days", "hours", "minutes", "seconds", "milliseconds")
  ), r = o(() => t.value.days), u = o(() => t.value.hours), c = o(() => t.value.minutes), i = o(() => t.value.seconds), m = o(() => t.value.milliseconds), d = o(() => s.raw.as("seconds")), l = o(() => s.raw.as("minutes")), f = o(() => s.raw.as("hours")), w = o(
    () => t.value.toFormat("d'd' hh:mm:ss")
  );
  function h(n) {
    s.raw = a.fromObject(n);
  }
  function v(n) {
    s.raw = s.raw.plus(n);
  }
  function p(n) {
    s.raw = s.raw.minus(n);
  }
  function b() {
    s.raw = a.fromMillis(0);
  }
  return {
    state: s,
    normalized: t,
    days: r,
    hours: u,
    minutes: c,
    seconds: i,
    milliseconds: m,
    asSeconds: d,
    asMinutes: l,
    asHours: f,
    formatted: w,
    set: h,
    add: v,
    subtract: p,
    reset: b
  };
}
export {
  M as useDuration
};
