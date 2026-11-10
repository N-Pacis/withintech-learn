import { randInts, type ChallengeDraft } from "../types";

function solve(arrivals: number[], seats: number, maxWait: number): number[] {
  const departures: number[] = [];
  let i = 0;
  while (i < arrivals.length) {
    const deadline = arrivals[i] + maxWait;
    let boarded = 0;
    let lastBoard = arrivals[i];
    while (i < arrivals.length && boarded < seats && arrivals[i] <= deadline) {
      lastBoard = arrivals[i];
      boarded++;
      i++;
    }
    departures.push(boarded === seats ? lastBoard : deadline);
  }
  return departures;
}

function busyMorning(): number[] {
  const gaps = randInts(5501, 3000, 0, 4);
  let t = 0;
  return gaps.map((g) => (t += g));
}

export const nyabugogoLeaveWhenFull: ChallengeDraft = {
  title: "Nyabugogo: Leave When Full",
  difficulty: "medium",
  description: `
<p>At Nyabugogo bus park, coasters to a given town do not run on a timetable: a coaster leaves as soon as it is <strong>full</strong>. To keep early passengers from waiting forever, the park rule says it must also leave once the <strong>first passenger on board has waited <code>maxWait</code> minutes</strong>, full or not.</p>
<p><strong>You are given:</strong></p>
<ul>
<li><code>arrivals</code>: the minute each passenger reaches the loading bay, sorted, possibly with several passengers in the same minute</li>
<li><code>seats</code>: seats per coaster (at least 1)</li>
<li><code>maxWait</code>: the longest the first passenger may wait, in minutes</li>
</ul>
<p><strong>Rules:</strong></p>
<ol>
<li>Passengers board the waiting coaster in arrival order. The first one to board starts the clock.</li>
<li>The coaster leaves the minute its last seat is filled, or at <code>firstArrival + maxWait</code>, whichever comes first.</li>
<li>A passenger arriving exactly at the deadline minute still gets on if a seat is free.</li>
<li>The next coaster starts loading straight away with the next passenger.</li>
</ol>
<p><strong>Return the departure minute of every coaster, in order.</strong></p>`,
  functionParams: [
    { name: "arrivals", type: "int[]" },
    { name: "seats", type: "int" },
    { name: "maxWait", type: "int" },
  ],
  returnType: "int[]",
  solve,
  visible: [
    [[0, 2, 3, 3, 10, 11, 40], 3, 15],
    [[5, 9, 30], 4, 20],
  ],
  hidden: [
    [[], 18, 30],
    [[7], 1, 30],
    [[0, 0, 0, 0, 0], 2, 10],
    [[0, 10, 20], 5, 10],
    [[0, 11, 22, 33], 5, 10],
    [[1, 2, 3, 4, 100, 101, 102, 103, 104], 4, 60],
    [busyMorning(), 18, 25],
    [busyMorning(), 29, 12],
  ],
};
