function random(array) {
  return array[Math.floor((Math.random()*array.length))];
}

function get_payout_over100() {
  //(Math.floor(Math.random()*12)/100)+0.03
  let payouts = [0.03, 0.04, 0.04, 0.05, 0.05, 0.05, 0.05, 0.06, 0.06, 0.07, 0.07, 0.08, 0.09, 0.10, 0.11, 0.12, 0.13, 0.14, 0.15];
  return random(payouts);
}

function get_payout_under100() {
  //(Math.floor(Math.random()*12)/100)+0.03
  let payouts = [0.01, 0.01, 0.02, 0.02, 0.03, 0.03, 0.04, 0.04, 0.05, 0.06, 0.07, 0.08];
  return random(payouts);
}

module.exports = {
  get_payout_under100: get_payout_under100,
  get_payout_over100: get_payout_over100
}