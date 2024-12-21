window.Booster = window.Booster || {};
var Booster = window.Booster;

var adData = undefined;
var bannerRequested = false;

const ANALYTICS_ACCOUNT_ID = ['UA-34318136-1'];
if (window.GAME_ANALYTIC_ID) {
    ANALYTICS_ACCOUNT_ID.push(window.GAME_ANALYTIC_ID);
}

console.warn(`[Booster] Using CrazyGames booster SDK!`);

Booster.Init = function () {
    return {};
};

Booster.Ad = function () {
    return {
        showAdvertising: function (data) {
            showCrazyAd(data, false);
        }
    };
};

Booster.RewardedVideo = {
    play: function (callback, context) {
        showCrazyAd({ callback, context }, true);
    }
};

Booster.Analytics = function (params) {
    console.log(`[Booster] Constructed analaytics`, params);
    this.firstMenuLoad = true;
    this.gameId = params.gameId;
    this.name = params.gameName;
    this.developer = params.developer;
    this.category = params.gameCategory;
    this.sessionId = '';
    if (params.bmsource !== void 0) {
        this.bmsource = params.bmsource;
    }

    this.initialize = function() {
        console.log(`[Booster] Initializing analaytics`, ANALYTICS_ACCOUNT_ID);

        //-- add script Google Analytics
        var ga = document.createElement("script");
        ga.type = "text/javascript";
        ga.async = true;
        ga.src = ("https:" === document.location.protocol ? "https://ssl" : "http://www") + ".google-analytics.com/ga.js";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(ga, s);

        this._setVariables();
        this.initialized();
    }

    this._setVariables = function() {
        var source = String(this.bmsource);
        var dimension = "";

        //-- confif Google Analytics
        window._gaq = window._gaq || [];
        for (var i = 0; i < ANALYTICS_ACCOUNT_ID.length; i++) {
            window._gaq.push(["b._setAccount", ANALYTICS_ACCOUNT_ID[i]]);

            window._gaq.push(["b._setCustomVar", 1, "GameName", String(this.name), 3]);
            window._gaq.push(["b._setCustomVar", 2, "GameID", String(this.gameId), 3]);
            window._gaq.push(["b._setCustomVar", 3, "Category", String(this.category), 3]);
            window._gaq.push(["b._setCustomVar", 4, "dimension1", String(dimension), 3]);
            window._gaq.push(["b._setCustomVar", 5, "Source", String(source), 3]);
        }
    };
    this.initialized = function() {
        console.log('[Booster] Analytics initialized!');
        if (this.firstMenuLoad) {
            this.firstMenuLoad = false;
            this.gamePlay();
        }
        this._trackEventGoogle("initialized");
    };

    this.gamePlay = function() {
        this._trackPageGoogle("gameplay");
    };
    this.menu = function() {
        this._trackEventGoogle("menu");
    };
    this.level = function(level) {
        this._trackEventGoogle("level", parseInt(level));
    };
    this.score = function(score) {
        this._trackEventGoogle("score", parseInt(score));
    };
    this.levelFailed = function(level) {
        this._trackEventGoogle("level failed", parseInt(level));
    };

    this.customEvent = function(eventName, eventData) {
        if (eventData == undefined) {
            this._trackEventGoogle(eventName);
        } else {
            try {
                this._trackEventGoogle(eventName, eventData);
            } catch (e) {
                console.log("eventData isn't supported in this way, maybe you made a mistake?");
                console.log(e);
            }
        }
    };

    this._trackPageGoogle = function(pageTitle) {
        const page = `/ingame/${this.category}/${this.developer}/${this.gameId}/${this.name}/${pageTitle}`;
        console.log(`[Booster] Tracking analytics page ${pageTitle}.`, page);

        for (var i = 0; i < ANALYTICS_ACCOUNT_ID.length; i++) {
            window._gaq.push(["b._setAccount", ANALYTICS_ACCOUNT_ID[i]]);
            window._gaq.push(["b._trackPageview", page]);
        }
    };
    this._trackEventGoogle = function(eventName, eventData) {
        console.log(`[Booster] Tracking analytics event ${eventName}.`, eventData);
        for (var i = 0; i < ANALYTICS_ACCOUNT_ID.length; i++) {
            window._gaq.push(["b._setAccount", ANALYTICS_ACCOUNT_ID[i]]);

            if (typeof eventData == "number") {
                window._gaq.push(["b._trackEvent", this.gameId, eventName, null, eventData]);
            } else if (typeof eventData == "undefined") {
                window._gaq.push(["b._trackEvent", this.gameId, eventName, null]);
            } else {
                window._gaq.push(["b._trackEvent", this.gameId, eventName, String(eventData)]);
            }
        }
    }

    this.initialize();
};

Booster.AdBanner = function () {
    return {
        show: function () {
            console.log('Request banner');
           requestBanner();
        }
    };
};


Booster.Community = function () {
    return {
        submitScore: function (data) {
            data.callback && data.callback();
        },
        submitLevelStart: function () { }
    };
};

Booster.Moregames = function () {
    return {
        redirect: function () { }
    };
};

Booster.Freemium = function () {
    return {
        purchase: function (a, b, d, e, g) {

        }
    };
};

function requestBanner() {
    if (!document.getElementById('banner-container')) {
        setTimeout(requestBanner, 100);
        return;
    }

    console.log('Request ad banner...');
    Booster.crazySDK.requestBanner([
        {
            containerId: 'banner-container',
            size: '320x50',
        }
    ]);
    setTimeout(requestBanner, 61 * 1000);
}

function showCrazyAd(data, rewarded) {
    if (adData) {
        adComplete(new Error('Another ad is already playing!'), 'INTERSTITAL');
        return;
    }
    adData = data;

    Booster.onOpenTab && Booster.onOpenTab();
    adData = data;
    Booster.crazySDK.requestAd(rewarded ? 'rewarded' : 'midgame');
}

function adStarted(param) {
    console.log(`[Booster] ad started!`, param);
}

function adError(error) {
    console.warn(`[Booster] ad error!`, error);
    this.adComplete(error);
}

function adFinished(result) {
    console.warn(`[Booster] ad finished!`, result);
    this.adComplete(result);
}

function adComplete(result, type) {
    if (result instanceof Error) {
        console.error(`[Booster] CrazyGames ${type ? type : ""} ad error!`, result);
    } else if (result === false) {
        console.warn(`[Booster] CrazyGames ${type ? type : ""} ad failed!`);
    } else {
        console.log(`[Booster] CrazyGames ${type ? type : ""} ad completed!`);
    }

    if (!adData) {
        console.warn(`[Booster] no ad data!`);
        return;
    }
    Booster.onCloseTab && Booster.onCloseTab();

    const failed = result instanceof Error || result === false;
    if (adData.failCallback && failed) {
        if (adData.context) {
            console.log(`[Booster] Ad failed, calling failCallback with context`);
            adData.failCallback.call(adData.context, result);
        } else {
            console.log(`[Booster] Ad failed, calling failCallback without context`);
            adData.failCallback(result);
        }
        adData = undefined;
        return;
    }
    
    if (adData.context) {
        console.log(`[Booster] Calling ad callback with context`);
        adData.callback.call(adData.context, result);
    } else {
        console.log(`[Booster] Calling ad callback without context`);
        adData.callback(result);
    }

    adData = undefined;
}

function initSDK() {
    console.log(`[Booster] ready!`);
    Booster.crazySDK = window.CrazyGames.CrazySDK.getInstance();
    console.log("[Booster] CrazyGames loaded", Booster.crazySDK);

    Booster.ready && (typeof Booster.ready == "function") && Booster.ready();
    Booster.ready = true;
    
    Booster.crazySDK.addEventListener('initialized', sdkInitialized);
    Booster.crazySDK.addEventListener('adStarted', adStarted);
    Booster.crazySDK.addEventListener('adError', adError);
    Booster.crazySDK.addEventListener('adFinished', adFinished);
    Booster.crazySDK.init();

    setTimeout(() => {
        console.log(`[Booster] Faked splash finish`);
        Booster.onSplashFinishedEvent && Booster.onSplashFinishedEvent();
    }, 100);
};

function sdkInitialized() {
    console.log("[Booster] CrazyGames initialized");
}

window.onfocus = function () {
    Booster.onCloseTab && Booster.onCloseTab();
};

window.onblur = function () {
    Booster.onOpenTab && Booster.onOpenTab();
};


(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = 'patch/js/crazygames-sdk-v1.js';
    js.onload = initSDK;
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'yandex-sdk'));