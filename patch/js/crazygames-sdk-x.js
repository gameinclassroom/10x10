// this.postEvent("adFinished")
// this.postEvent("adCompleted")
// https://games.crazygames.com/en_US/air-toons/index.html
Crazygames= {
  "init": function(option) {
    // console.trace("--init--", option);
    console.log("--init--", option);
    return true;
  },
  "requestAd": async function(p, t) {
    console.log("--fx--Browser--", Browser);
    console.trace("p", p, "t", t);
    return 0;
  }
}
