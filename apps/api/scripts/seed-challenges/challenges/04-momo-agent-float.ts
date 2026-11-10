import type { ChallengeDraft } from "../types";

function solve(cash: number, emoney: number, ops: number[]): number[] {
  let rejected = 0;
  for (const op of ops) {
    if (op > 0) {
      // Deposit: customer hands over cash, agent sends e-money.
      if (emoney < op) { rejected++; continue; }
      cash += op;
      emoney -= op;
    } else if (op < 0) {
      // Withdrawal: customer sends e-money, agent pays out cash.
      const amount = -op;
      if (cash < amount) { rejected++; continue; }
      cash -= amount;
      emoney += amount;
    }
  }
  return [cash, emoney, rejected];
}

export const momoAgentFloat: ChallengeDraft = {
  title: "MoMo Agent Float",
  difficulty: "medium",
  description: `
<p>A mobile money agent in a trading centre keeps <strong>two separate balances</strong>: physical cash in the drawer and electronic money (the "float") on the agent line. Every transaction moves value from one balance to the other, so an agent can have plenty of money in total and still have to turn customers away.</p>
<p><strong>You are given:</strong></p>
<ul>
<li><code>cash</code>: RWF in the drawer at opening</li>
<li><code>emoney</code>: RWF of float on the agent line at opening</li>
<li><code>ops</code>: the day's transactions in order. A positive number is a <strong>deposit</strong>, a negative number is a <strong>withdrawal</strong> of that many RWF.</li>
</ul>
<p><strong>Rules:</strong></p>
<ol>
<li><strong>Deposit</strong> of <code>x</code>: the customer gives cash, the agent sends e-money. Cash increases by <code>x</code>, float decreases by <code>x</code>.</li>
<li><strong>Withdrawal</strong> of <code>x</code>: the customer sends e-money, the agent pays cash. Float increases by <code>x</code>, cash decreases by <code>x</code>.</li>
<li>If a transaction would make either balance negative, the agent <strong>rejects</strong> it and nothing changes.</li>
<li>A <code>0</code> entry does nothing and is not a rejection.</li>
</ol>
<p><strong>Return <code>[finalCash, finalFloat, rejectedCount]</code>.</strong></p>`,
  functionParams: [
    { name: "cash", type: "int" },
    { name: "emoney", type: "int" },
    { name: "ops", type: "int[]" },
  ],
  returnType: "int[]",
  solve,
  visible: [
    [50000, 20000, [10000, -30000, 15000, -70000]],
    [0, 100000, [-5000, 40000, 60000, 1000]],
  ],
  hidden: [
    [10000, 10000, []],
    [10000, 10000, [0, 0]],
    [10000, 10000, [10000, -20000]],
    [10000, 10000, [10001]],
    [5000, 5000, [-5000, -1, 5000, 5000, 1]],
    [200000, 0, [-50000, -50000, 30000, 80000, -120000, 70000, -10000]],
    [1000000, 1000000, [250000, -400000, 900000, -1500000, 300000, -2000, 2000, -999999, 1]],
  ],
};
