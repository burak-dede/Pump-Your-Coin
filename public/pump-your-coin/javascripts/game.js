let backColors = [0.156, 0.705, 0.901];
let screenWidth, screenHeight, acc_coef = 0.5, takeoff = false, fuel = 1, gameover = false;

let rocket, nasa, ground, cloud, cloud2, cloud3, cloud4, world, space1, space2, fuelBody, fuelLevel, redCandle,
    greenCandle,
    coinBtc = null,
    coinUSD = null,
    pumpRate = null,
    explosion = null,
    levelMessage = null, levelLabel = null, lastMessageIndex = 0, nextMessageLevel = 1;

let coinBtcValue = 0.00000001, coinUSDValue = 0, pumpRateValue = 1, coinSymbol, selectedCoinUpper, fuelInterval,
    coinInterval, isGameStopped = false, digitBtc = 4, digitUsd = 4;

let virBTC = 0, pumpRateIncrease = 0.005;

let rocketFrames = [], redCandleFrames = [], greenCandleFrames = [], explosionFrames = [];

let candles = [];

let cutout = false;

let velocityMin = 1, velocityMax = 3;

let url = new URL(location.href);
let queryId = url.searchParams.get("id");
let playerName = null;

function Candle(color, sprite, id) {
    this.color = color;
    this.sprite = sprite;
    this.id = id;
    this.velocity = 5;
    this.burning = false;
    this.move = true;
    this.m = null;
    this.x1 = 0;
    this.y1 = 0;
    this.destroyLocY = 150;
    this.reposition = function () {

        this.destroyLocY = randomInt(150, 350);

        if (!this.burning) {
            let pos = getRandomPosition();

            [sprite.x, sprite.y] = pos;
            [this.x1, this.y1] = pos;

            if (rocket.x - this.x1 != 0) {
                this.m = (rocket.y + rocket.height / 1.5 - this.y1) / (rocket.x - this.x1);
            } else {
                this.m = null;
            }

            if (this.m > 0) {
                this.sprite.rotation = -1.5707963268 + Math.atan(this.m);
            } else if (this.m == null) {
                this.sprite.rotation = 0;
            } else {
                this.sprite.rotation = 1.5707963268 + Math.atan(this.m);
            }
            this.velocity = randomInt(velocityMin, velocityMax);
        }
    }
}

let Application = PIXI.Application,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    Container = PIXI.Container,
    Rectangle = PIXI.Rectangle;

let app = new Application({
        width: 320,     // Min Iphone 5 resolution
        height: 568,
        antialias: false,
        transparent: false,
        resolution: 1,
        forceCanvas: true
    }
);

let HS = PIXI.utils.rgb2hex(backColors);

app.renderer.backgroundColor = HS;

document.getElementById("game").appendChild(app.view);
document.getElementById("share").addEventListener("click", shareScore);

screenWidth = app.screen.width;
screenHeight = app.screen.height;

screenWidthCenter = screenWidth / 2;
screenHeightCenter = screenHeight / 2;

loader
    .add("rocket", "assets/spritesheet/rocket.json")
    .add("candle", "assets/spritesheet/candle.json")
    .add("exp", "assets/spritesheet/explo.json")
    .add("nasa", "assets/nasa.png")
    .add("ground", "assets/ground.svg")
    .add("cloud", "assets/clouds.png")
    .add("world", "assets/world.png")
    .add("space1", "assets/space1.png")
    .add("space2", "assets/space2.png")
    .add("fuel1", "assets/fuel_1.png")
    .add("fuel2", "assets/fuel_2.svg")
    .load(setup);

window.addEventListener("resize", function (event) {
    scaleToWindow(app.view);
});

scaleToWindow(app.view);
scaleDivToWindow("banner");

window.addEventListener("resize", function () {
    scaleDivToWindow("banner");
}, false);

let scoreTextStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 25,
    fontStyle: 'italic',
    fontWeight: 'bold',
    fill: '#fe0000',
    stroke: '#ffffff',
    strokeThickness: 5,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 2,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 1,
    wordWrap: true,
    padding: 10
});

let priceTextStyle1 = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontStyle: 'bold',
    fontSize: 15,
    fill: '#000000',
});

let priceTextStyle2 = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontStyle: 'bold',
    fontSize: 15,
    fill: '#ffffff',
});

let coinSymbolTextStyle = new PIXI.TextStyle({
    fontFamily: 'Montserrat',
    fontSize: 20,
    fontWeight: 'bold',
    fill: ['#fe0000', '#c10000'],
    fillGradientType: PIXI.TEXT_GRADIENT.LINEAR_HORIZONTAL,
    wordWrap: true,
    wordWrapWidth: 440,
    align: 'center'

});


let levelTextStyle1 = new PIXI.TextStyle({
    fontFamily: 'Montserrat',
    fontStyle: 'bold',
    fontSize: 13,
    fill: '#00fe4a',
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 1,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 1,
    wordWrap: true,
    padding: 20,
});
let levelTextStyle2 = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontStyle: 'bold',
    fontSize: 11,
    fill: '#ffffff',
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 1,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 1,
    wordWrap: true,
    wordWrapWidth: 440,
    padding: 10,
});


let score = new PIXI.Text('', scoreTextStyle);
let recentScore = 0;
let lastScore = 0;

let scoreMessages = ["You can do better.", "You can pump higher."];
let levelMessages = ["McDonald's Worker", "Hyundai Owner", "Miami Beach Regular", "Audi Owner", "Crypto Influencer", "Hawaii Regular", "Boyfriend of Top Model", "Yacht Owner", "Ferrari Owner", "Maldives Regular", "Playboy", "Lambo Owner", "Superyacht Owner", "Private Jet Owner", "Dubai Princess", "Satoshi Nakamoto"];

if (typeof (Storage) !== "undefined") {
    if (localStorage.getItem("tutorialShow") == null) {
        localStorage.setItem("tutorialShow", "1");
    }
}


let sc = document.getElementsByTagName("tr");
if (sc.length > 0) {
    for (let i = 0; i < sc.length; i++) {
        if (sc.item(i).getElementsByTagName("td").item(1).getAttribute("data-id") != "") {
            lastScore = parseInt(sc.item(i).getElementsByTagName("td").item(1).innerHTML);
            playerName = sc.item(i).getElementsByTagName("td").item(0).innerHTML;
        }
    }
}


infoCheck();

window.loaded = 0;
window.started = 0;

let start = function () {

    if (window.loaded != 1) {
        if (window.started == 0) {
            window.started = 1;
        }
    } else {
        playMusic();

        isGameStopped = false;

        fuelInterval = setInterval(fuelTimer, 100);
        coinInterval = setInterval(coinTimer, 100);

        if (document.getElementById("scoreBoard").classList.contains("disabled")==false) {
            document.getElementById("scoreBoard").classList.add("disabled");
        }
        if (document.getElementById("share").classList.contains("disabled")==false) {
            document.getElementById("share").classList.add("disabled");
        }
        if (!gameover) {
            document.getElementById("menu").classList.add("disabled");
            document.getElementById("start-button").childNodes[0].nodeValue = "PUMP AGAIN";
            document.getElementById("start-button").style.fontSize = "0.9em";
            gameover = true;
            app.ticker.add(gameLoop);
        } else {
            document.getElementById("menu").classList.add("disabled");
            app.start();
        }

        rocketFrames.pop();
        rocket.play();

        if (redCandleFrames.length == 0) {
            for (let i = 0; i <= 17; i++) {
                redCandleFrames.push(PIXI.Texture.fromFrame('red_candle (' + i + ').png'));
            }
        }
        if (greenCandleFrames.length == 0) {
            for (let i = 0; i <= 17; i++) {
                greenCandleFrames.push(PIXI.Texture.fromFrame('green_candle (' + i + ').png'));
            }
        }

        let i = 0;

        for (i = 0; i < 5; i++) {
            redCandle = new PIXI.extras.AnimatedSprite(redCandleFrames);
            redCandle.anchor.set(0.5);
            redCandle.loop = false;
            redCandle.animationSpeed = 0.5;

            redCandle.interactive = true;

            redCandle.id = i;

            let candle = new Candle("red", redCandle, i);

            candle.reposition();

            app.stage.addChild(candle.sprite);
            candle.sprite.gotoAndStop(0);
            candle.sprite.on('pointerdown', function () {
                if (!candle.burning && candle.move) {
                    candle.burning = true;
                    fireCandle(candle.sprite);
                }
            });

            candles.push(candle);

        }
        for (; i < 7; i++) {
            greenCandle = new PIXI.extras.AnimatedSprite(greenCandleFrames);
            greenCandle.anchor.set(0.5);
            greenCandle.loop = false;
            greenCandle.animationSpeed = 0.5;
            greenCandle.interactive = true;
            greenCandle.id = i;

            let candle = new Candle("green", greenCandle, i);


            candle.reposition();

            app.stage.addChild(candle.sprite);
            candle.sprite.gotoAndStop(0);

            candle.velocity = 2;
            candle.sprite.on('pointerdown', function () {
                if (!candle.burning && candle.move) {
                    candle.burning = true;
                    fireCandle(candle.sprite);
                }
            });
            candles.push(candle);

        }
        fuelBody = new Sprite(
            loader.resources.fuel1.texture
        );
        fuelBody.anchor.set(1, 1);
        fuelBody.x = screenWidth - 10;
        fuelBody.y = screenHeight - 20;


        app.stage.addChild(fuelBody);

        fuelLevel = new Sprite(
            loader.resources.fuel2.texture
        );
        fuelLevel.scale.set(1, fuel);
        fuelLevel.anchor.set(1, 1);
        fuelLevel.x = screenWidth - 10;
        fuelLevel.y = screenHeight - 20;


        app.stage.addChild(fuelLevel);
        app.stage.addChild(score);

        score.x = screenWidthCenter - (score.width / 2);


        if (explosionFrames.length === 0) {
            for (let i = 1; i <= 62; i++) {
                explosionFrames.push(PIXI.Texture.fromFrame('explo (' + i + ').png'));
            }
        }
        explosion = new PIXI.extras.AnimatedSprite(explosionFrames);
        explosion.x = 50;
        explosion.y = -100;
        explosion.anchor.set(0.5);
        explosion.scale.set(0.4);
        explosion.loop = false;
        app.stage.addChild(explosion);

        if (levelLabel == null) {
            levelLabel = new PIXI.Text("YOUR LEVEL", levelTextStyle1);
            levelLabel.x = 10;
            levelLabel.y = screenHeight - 55;
            app.stage.addChild(levelLabel);
        }

    }
};

function setup() {

    if (rocketFrames.length == 0) {
        for (let i = 1; i <= 2; i++) {
            rocketFrames.push(PIXI.Texture.fromFrame('rocket_fire' + i + '.png'));
        }
        rocketFrames.push(PIXI.Texture.fromFrame('rocket_normal.png'));
    }

    rocket = new PIXI.extras.AnimatedSprite(rocketFrames);
    rocket.scale.set(0.5);
    rocket.anchor.set(0.5, 0);
    rocket.x = screenWidthCenter;
    rocket.y = screenHeight - 180;
    rocket.animationSpeed = 0.21;
    rocket.gotoAndStop(2);
    rocket.blinking = false;


    nasa = new Sprite(
        loader.resources.nasa.texture
    );
    nasa.scale.set(0.25);
    nasa.anchor.set(0.5, 1.0);
    nasa.x = 70;
    nasa.y = screenHeight - 80;

    ground = new Sprite(
        loader.resources.ground.texture
    );
    ground.scale.set(4, 2);
    ground.anchor.set(0.5, 1.0);
    ground.x = 0;
    ground.y = screenHeight;

    cloud = new Sprite(
        loader.resources.cloud.texture
    );
    cloud.scale.set(0.75);
    cloud.anchor.set(0.5, 0);
    cloud.x = 0;
    cloud.y = screenHeight - 600;

    cloud2 = new Sprite(
        loader.resources.cloud.texture
    );
    cloud2.scale.set(0.3, 0.2);
    cloud2.anchor.set(0.5, 0);
    cloud2.x = screenWidthCenter;
    cloud2.y = screenHeight - 250;

    cloud3 = new Sprite(
        loader.resources.cloud.texture
    );
    cloud3.scale.set(3, 2);
    cloud3.anchor.set(0.5, 0);
    cloud3.x = screenWidthCenter;
    cloud3.y = -700;

    cloud4 = new Sprite(
        loader.resources.cloud.texture
    );
    cloud4.scale.set(3, 2);
    cloud4.anchor.set(0.5, 0);
    cloud4.x = screenWidthCenter;
    cloud4.y = -900;


    world = new Sprite(
        loader.resources.world.texture
    );
    world.scale.set(1, 0.5);
    world.anchor.set(0.5, 0);
    world.x = screenWidthCenter;
    world.y = -700;

    space1 = new Sprite(
        loader.resources.space1.texture
    );
    space1.anchor.set(0.5, 0);
    space1.x = screenWidthCenter;
    space1.y = -568;

    space2 = new Sprite(
        loader.resources.space2.texture
    );
    space2.anchor.set(0.5, 0);
    space2.x = screenWidthCenter;
    space2.y = -568;

    app.stage.addChild(space1, space2, world, cloud, cloud2, cloud3, cloud4, ground, nasa, rocket);

    readIco(document.getElementById("icoInput").value);
}

function gameLoop(delta) {


    if (!takeoff) {

        if (world.y < screenHeight) {

            nasa.y += acc_coef;
            ground.y += acc_coef;
            cloud.y += 0.15;
            cloud2.y += 0.1;
            cloud3.y += 0.2;
            cloud4.y += 0.2;
            world.y += 0.2;

            if (space1.y > -5) {
                space2.y += 0.2;
            }
            if (world.y > -150) {
                space1.y += 0.2;
            }
            if (acc_coef < 6) {
                acc_coef += 0.05 * acc_coef;
            }

        } else {
            acc_coef = 0;
            app.stage.removeChild(nasa);
            app.stage.removeChild(ground);
            app.stage.removeChild(cloud);
            app.stage.removeChild(cloud2);
            app.stage.removeChild(cloud3);
            app.stage.removeChild(cloud4);
            takeoff = true;
        }

    } else {
        space1.y += 0.05;
        space2.y += 0.05;
        if (space1.y > screenHeight - 5) {
            space1.y = -563;
        }
        if (space2.y > screenHeight - 5) {
            space2.y = -563;
        }
    }

    if (coinUSD != null && coinUSD.style !== priceTextStyle2 && coinBtc != null && world.y - 60 > coinBtc.x) {
        coinUSD.style = priceTextStyle2;
        coinBtc.style = priceTextStyle2;
    }

    if (velocityMin == 1 && space1.y > 0) {
        velocityMin = 2;
        velocityMax = 5;
    } else if (velocityMin == 2 && pumpRateValue > 10) {
        velocityMin = 3;
        velocityMax = 6;
    } else if (velocityMin == 3 && pumpRateValue > 15) {
        velocityMin = 4;
        velocityMax = 7;
    }

    let iterators = candles.values();

    for (let candle of iterators) {

        /*        if (candle.color == "red" && candle.move && !candle.burning) {
                    if (candle.sprite.y>= candle.destroyLocY) {
                        candle.burning = true;
                        fireCandle(candle.sprite);
                    }

                }*/
        if (candle.sprite.y + 17 > (screenHeight - 180) && candle.sprite.x > screenWidthCenter - 25 && candle.sprite.x < screenWidthCenter + 25 && candle.move && !candle.burning) {


            renewFuel(candle);
            if (candle.color == "red") {
                candle.burning = true;
                candle.move = false;
                fireCandle(candle.sprite);

                explosion.x = candle.sprite.x;
                explosion.y = candle.sprite.y + 17;
                explosion.gotoAndPlay(0);
                explosion.onComplete = function () {
                    if (isGameStopped) {
                        return;
                    }
                    explosion.x = 50;
                    explosion.y = -100;
                };

            } else if (candle.color == "green") {
                cutout = true;
                fadeOutSprite(candle.sprite);
                blinkSprite(rocket);
            }
        }
        if (candle.sprite.y < screenHeight + 46 && candle.move && !candle.burning) {
            candle.sprite.y += candle.velocity;
            if (candle.m != null) {
                candle.sprite.x = ((candle.sprite.y - candle.y1) / candle.m) + candle.x1;
            }
        }
    }

    let pumpRateFloor = Math.floor(pumpRateValue);

    if (pumpRateFloor < 10 && pumpRateFloor % nextMessageLevel === 0) {
        showLevelMessage(levelMessages[lastMessageIndex]);
        //console.log("level: ",pumpRateFloor, " Message : ",levelMessages[lastMessageIndex]);
        lastMessageIndex++;
        nextMessageLevel++;
    } else if (pumpRateFloor < 26 && pumpRateFloor % nextMessageLevel === 0) {
        showLevelMessage(levelMessages[lastMessageIndex]);
        lastMessageIndex++;
        nextMessageLevel += 2;
    }

    if (fuel <= 0) {
        isGameStopped = true;
        clearInterval(fuelInterval);
        clearInterval(coinInterval);
        showResult();
        console.log("stopped");
        app.stop();
    }

}

function showLevelMessage(message) {

    if (levelMessage == null) {
        levelMessage = new PIXI.Text(message, levelTextStyle2);
        levelMessage.x = 10;
        levelMessage.y = screenHeight - 35;
        app.stage.addChild(levelMessage);
    } else {
        levelMessage.text = message;
    }

}

async function fadeOutSprite(sprite) {

    candles[sprite.id].burning = true;
    for (let i = 1; i >= 0; i -= 0.05) {
        sprite.alpha = i;
    }
    sprite.alpha = 1;
    candles[sprite.id].burning = false;
    candles[sprite.id].reposition();
}

async function blinkSprite(sprite) {

    let count = 0;
    cutout = false;
    while (count < 2) {

        if (cutout) {
            cutout = false;
            break;
        }
        for (let i = 1; i >= 0.5; i -= 0.05) {
            if (cutout) {
                break;
            }
            sprite.alpha = i;
            if (coinSymbol != null) {
                coinSymbol.alpha = i;
            }
            await sleep(25);
        }
        for (let i = 0.5; i <= 1; i += 0.05) {
            if (cutout) {
                break;
            }
            i = parseFloat(i.toFixed(2));
            sprite.alpha = i;
            if (coinSymbol != null) {
                coinSymbol.alpha = i;
            }
            await sleep(25);
        }
        count++;
    }
}

function fireCandle(sprite) {
    sprite.interactive = false;
    candles[sprite.id].move = false;
    sprite.gotoAndPlay(1);
    sprite.onComplete = function () {
        if (isGameStopped) {
            return;
        }
        sprite.gotoAndStop(0);
        candles[sprite.id].burning = false;
        candles[sprite.id].move = true;
        candles[sprite.id].reposition();
        sprite.interactive = true;
    };
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showResult() {
    cleanStage();
    recentScore = pumpRateValue.toFixed(3) + "x";
    let score = parseFloat(pumpRateValue.toFixed(3)) * 1000;
    lastScore = score;
    if (queryId != null){
        setHighScore(parseInt(score));
        scoreTableUpdate(parseInt(score));
        document.getElementById("scoreBoard").classList.remove("disabled");
    }else{
        localStorage.setItem("lastScore", ""+score);
    }
    if (pumpRateValue >= 2) {
        localStorage.setItem("tutorialShow", "0");
        document.getElementById("score").innerText = recentScore;
        document.getElementById("message").innerText = scoreMessages[randomInt(0, scoreMessages.length - 1)];
    } else {
        localStorage.setItem("tutorialShow", "1");
        document.getElementById("score").innerText = "";
        document.getElementById("message").innerText = "";
    }
    document.getElementById("menu").classList.remove("disabled");
    infoCheck();
    scaleDivToWindow("banner");
    resetValues();
    setup();
}

function cleanStage() {
    for (let i = app.stage.children.length - 1; i >= 0; i--) {
        app.stage.removeChild(app.stage.children[i]);
    }
}

function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function infoCheck() {

    if (queryId != null){
        if (lastScore < 2000) {
            if (document.getElementById("info") == null) {
                let el = document.createElement("div");
                el.className = "info";
                el.id = "info";
                let ref = document.getElementById("message");
                insertAfter(ref, el);
            }
            if (document.getElementsByTagName("tr").length == 0) {
                document.getElementById("scoreBoard").classList.add("disabled");
                document.getElementById("info").style.marginTop = "17%";
                document.getElementById("logo").style.marginTop = "20%";
            } else {
                document.getElementById("logo").style.marginTop = "10%";
            }

        } else {
            if (document.getElementById("info") != null) {
                document.getElementById("info").remove();
            }
            if (document.getElementsByTagName("tr").length == 0) {
                recentScore = (lastScore/1000).toFixed(3) + "x";
                if (lastScore >= 2000) {
                    document.getElementById("score").innerText = recentScore;
                    document.getElementById("message").innerText = scoreMessages[randomInt(0, scoreMessages.length - 1)];
                }
                document.getElementById("scoreBoard").classList.add("disabled");
                if (document.getElementById("score").innerText == "") {
                    document.getElementById("logo").style.marginTop = "65%";
                } else {
                    document.getElementById("score").style.marginTop = "20%";
                    document.getElementById("logo").style.marginTop = "20%";
                }
            } else {

                recentScore = (lastScore/1000).toFixed(3) + "x";
                if (lastScore >= 2000) {
                    document.getElementById("score").innerText = recentScore;
                    document.getElementById("message").innerText = scoreMessages[randomInt(0, scoreMessages.length - 1)];
                }
                if (lastScore>=5000) document.getElementById("share").classList.remove("disabled");

                if (document.getElementById("score").innerText == "") {
                    document.getElementById("logo").style.marginTop = "30%";
                } else {
                    document.getElementById("logo").style.marginTop = "10%";
                }
            }

        }
    }else{

        let lastScore = parseInt(localStorage.getItem("lastScore"));

        if (lastScore < 2000) {
            if (document.getElementById("info") == null) {
                let el = document.createElement("div");
                el.className = "info";
                el.id = "info";
                let ref = document.getElementById("message");
                insertAfter(ref, el);
            }

            document.getElementById("scoreBoard").classList.add("disabled");
            document.getElementById("info").style.marginTop = "17%";
            document.getElementById("logo").style.marginTop = "20%";

        } else {
            if (document.getElementById("info") != null) {
                document.getElementById("info").remove();
            }
            recentScore = (lastScore/1000).toFixed(3) + "x";
            if (lastScore >= 2000) {
                document.getElementById("score").innerText = recentScore;
                document.getElementById("message").innerText = scoreMessages[randomInt(0, scoreMessages.length - 1)];
            }
            document.getElementById("scoreBoard").classList.add("disabled");
            if (document.getElementById("score").innerText == "") {
                document.getElementById("logo").style.marginTop = "65%";
            } else {
                document.getElementById("score").style.marginTop = "20%";
                document.getElementById("logo").style.marginTop = "20%";
            }

        }
    }

}

function setHighScore(score) {
    if (queryId == null) return;
    // Submit highscore to Telegram
    var xmlhttp = new XMLHttpRequest();
    var url = "/highscore/" + score +
        "?id=" + queryId;
    xmlhttp.open("POST", url, true);
    xmlhttp.send();
}


function resetValues() {
    rocketFrames = [];
    pumpRate = null;
    fuel = 1;
    takeoff = false;
    acc_coef = 0.5;
    virBTC = 0;
    pumpRateValue = 1;
    coinBtc = null;
    coinUSD = null;
    pumpRate = null;
    coinBtcValue = 0;
    coinUSDValue = 0;
    pumpRateIncrease = 0.005;
    candles = [];
    explosion = null;
    velocityMin = 1;
    velocityMax = 3;
    lastMessageIndex = 0;
    nextMessageLevel = 1;
    levelMessage = null;
    levelLabel = null;
}


function fuelTimer() {
    if (fuel > 0.0033) {
        fuel -= 0.0033;
        fuelLevel.scale.set(1, fuel);
    } else {
        fuel = 0;
        fuelLevel.scale.set(1, 0);
    }
}

function renewFuel(obj) {
    if (obj.color === "red") {
        ((fuel < 1)) ? ((fuel - 0.1 < 0) ? fuel = 0 : fuel -= 0.1) : "";
    } else if (obj.color === "green") {
        ((fuel < 1)) ? ((fuel + 0.1 > 1) ? fuel = 1 : fuel += 0.1) : "";
    }


}

function coinTimer() {

    try {
        pumpRateValue += pumpRateIncrease;
        score.text = pumpRateValue.toFixed(3) + "x";
        score.x = screenWidthCenter - (score.width / 2);
        if (coinUSDValue != 0) {
            if (selectedCoinUpper == "BTC" || selectedCoinUpper == "BITCOIN") {
                let arrUsd = coinUSDValue * pumpRateValue;
                arrUsd = arrangeUSD(arrUsd);
                if (coinUSD != null) {
                    coinUSD.setText("$" + arrUsd);
                } else {
                    coinUSD = new PIXI.Text("$" + coinUSDValue.toFixed(8), priceTextStyle1);
                    coinUSD.x = rocket.x + 30;
                    coinUSD.y = rocket.y + 30;
                    app.stage.addChild(coinUSD);
                }
            } else {
                if (coinBtc != null) {
                    coinBtc.setText((coinBtcValue * pumpRateValue).toFixed(digitBtc) + " BTC");
                } else {
                    coinBtc = new PIXI.Text(coinBtcValue.toFixed(digitBtc) + " BTC", priceTextStyle1);
                    coinBtc.x = rocket.x + 30;
                    coinBtc.y = rocket.y + 15;
                    app.stage.addChild(coinBtc);
                }

                let arrUsd = coinUSDValue * pumpRateValue;
                arrUsd = arrangeUSD(arrUsd);
                if (coinUSD != null) {
                    coinUSD.setText("$" + arrUsd);
                } else {
                    coinUSD = new PIXI.Text("$" + arrUsd);
                    coinUSD.x = rocket.x + 30;
                    coinUSD.y = rocket.y + 30;
                    app.stage.addChild(coinUSD);
                }
            }
        }
    } catch (ex) {
        console.log(ex)
    }
}

function fetchJSONFile(path, callback) {
    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                let data = JSON.parse(httpRequest.responseText);
                if (callback) callback(data);
            }
        }
    };
    httpRequest.open('GET', path);
    httpRequest.send();
}

function readIco(myIco) {

    selectedCoinUpper = myIco.toUpperCase();
    if (typeof (Storage) !== "undefined") {
        if (localStorage.getItem("coinPrices") == null) {
            window.loaded = 0;
            fetchJSONFile('cmcPrices.json', function (icos) {
                localStorage.setItem("coinPrices", JSON.stringify(icos));
                setIcos(icos);
                console.log("yüklendi");
                window.loaded = 1;
                if (window.started == 1) {
                    start();
                    window.started = 0;
                }
            });
        } else {
            let icos = JSON.parse(localStorage.getItem("coinPrices"));
            let currentdate = new Date();
            let lastDate = new Date(icos[0]);
            var diff = (currentdate.getTime() - lastDate.getTime()) / 1000;
            diff /= (60 * 60);
            diff = Math.abs(Math.round(diff));
            if (diff >= 1) {
                window.loaded = 0;
                fetchJSONFile('cmcPrices.json', function (icos) {
                    localStorage.setItem("coinPrices", JSON.stringify(icos));
                    setIcos(icos);
                    console.log("yüklendi");
                    window.loaded = 1;
                    if (window.started == 1) {
                        start();
                        window.started = 0;
                    }
                });
            } else {
                setIcos(icos);
                window.loaded = 1;
                if (window.started == 1) {
                    start();
                    window.started = 0;
                }
            }
        }
    }
}

function setIcos(icos) {
    for (let i = 1; i < icos.length; i++) {
        if (icos[i].Name.toUpperCase() == selectedCoinUpper || icos[i].Symbol == selectedCoinUpper) {

            if (coinSymbol != null) {
                app.stage.removeChild(coinSymbol);
                coinSymbol = null;
            }
            coinSymbol = new PIXI.Text(textVerticalConvert(icos[i].Symbol), coinSymbolTextStyle);
            coinSymbol.anchor.set(.5, 0);
            coinSymbol.x = rocket.x;

            coinUSDValue = icos[i].USD;

            if (coinUSDValue == 0) {
                coinSymbolTextStyle.fontSize = 17;
                coinSymbol = new PIXI.Text(textVerticalConvert(selectedCoinUpper.substring(0, 3)), coinSymbolTextStyle);
                coinSymbol.anchor.set(.5, 0);
                coinSymbol.x = rocket.x;
                coinSymbol.y = rocket.y + 25;
                app.stage.addChild(coinSymbol);
                return;
            } else {
                if (icos[i].Symbol.length == 1) {
                    coinSymbolTextStyle.fontSize = 30;
                    coinSymbol.y = rocket.y + 40;
                } else if (icos[i].Symbol.length == 2) {
                    coinSymbolTextStyle.fontSize = 25;
                    coinSymbol.y = rocket.y + 28;
                } else if (icos[i].Symbol.length == 3) {
                    coinSymbolTextStyle.fontSize = 20;
                    coinSymbol.y = rocket.y + 24;
                } else if (icos[i].Symbol.length === 4) {
                    coinSymbolTextStyle.fontSize = 15;
                    coinSymbol.y = rocket.y + 22;
                } else if (icos[i].Symbol.length === 5) {
                    coinSymbolTextStyle.fontSize = 12;
                    coinSymbol.y = rocket.y + 18;
                } else {
                    coinSymbolTextStyle.fontSize = 7.5;
                    coinSymbol.y = rocket.y + 20;
                }
                app.stage.addChild(coinSymbol);
            }

            let arrUsd = arrangeUSD(coinUSDValue);

            if (coinUSD != null) {
                app.stage.removeChild(coinUSD);
                coinUSD = null;
            }

            coinUSD = new PIXI.Text("$" + arrUsd, priceTextStyle1);
            coinUSD.x = rocket.x + 30;
            coinUSD.y = rocket.y + 30;
            app.stage.addChild(coinUSD);
            pumpRateIncrease = 0.005;

            if (coinBtc != null) {
                app.stage.removeChild(coinBtc);
                coinBtc = null;
            }
            if (selectedCoinUpper === "BTC" || selectedCoinUpper === "BITCOIN") {
                coinBtc = new PIXI.Text("1 BTC", priceTextStyle1);
                coinBtc.x = rocket.x + 30;
                coinBtc.y = rocket.y + 15;
                app.stage.addChild(coinBtc);
            } else {
                let arrBtc = icos[i].BTC;

                digitBtc = 4;
                while (arrBtc < 1) {
                    arrBtc *= 10;
                    digitBtc++;
                }
                if (digitBtc > 8) digitBtc = 8;
                coinBtcValue = parseFloat(icos[i].BTC.toFixed(digitBtc));
                coinBtc = new PIXI.Text(coinBtcValue.toFixed(digitBtc) + " BTC", priceTextStyle1);
                coinBtc.x = rocket.x + 30;
                coinBtc.y = rocket.y + 15;
                app.stage.addChild(coinBtc);
            }

            app.render();
            return;
        }
    }

    coinUSDValue = 0;

    if (coinSymbol != null || coinUSD != null || coinBtc != null) {
        app.stage.removeChild(coinSymbol);
        coinSymbol = null;
        app.stage.removeChild(coinUSD);
        coinUSD = null;
        app.stage.removeChild(coinBtc);
        coinBtc = null;
        app.render();
    }
}

function arrangeUSD(value) {
    let arrUsd = value;
    if (arrUsd > 1) {
        digitUsd = 0;
        while (arrUsd > 1) {
            arrUsd /= 10;
            digitUsd++;
        }
        return value.toFixed(5 - digitUsd);
    } else {
        digitUsd = 4;
        while (arrUsd < 1) {
            arrUsd *= 10;
            digitUsd++;
        }
        return value.toFixed(digitUsd);
    }
}

function textVerticalConvert(text) {
    if (typeof text != "string") {
        return;
    }
    let newText = "";
    for (let i = 0; i < text.length; i++) {
        newText += text[i] + "\n";
    }
    return newText;
}

function scoreTableUpdate(score) {

    let sc = document.getElementsByTagName("tr");
    if (sc.length > 0) {
        for (let i = 0; i < sc.length; i++) {
            if (sc.item(i).getElementsByTagName("td").item(1).getAttribute("data-id") != "") {
                if (parseInt(sc.item(i).getElementsByTagName("td").item(1).innerHTML) > score) {
                    return;
                } else {
                    document.getElementsByTagName("tr").item(i).remove();
                    sc = document.getElementsByTagName("tr");
                }
            }
        }
        let newIndis = -1;
        for (let i = sc.length - 1; i >= 0; i--) {
            if (parseInt(sc.item(i).getElementsByTagName("td").item(1).innerHTML) < score) {
                newIndis = i;
            }
        }
        if (newIndis == -1) {
            return;
        }
        let tr = document.createElement("tr");
        let td = document.createElement("td");
        let td2 = document.createElement("td");
        let tda2 = document.createAttribute("data-id");
        tda2.value = queryId;
        let text1 = document.createTextNode(playerName);
        let text2 = document.createTextNode(score);
        td.appendChild(text1);
        td2.appendChild(text2);
        td2.setAttributeNode(tda2);
        tr.appendChild(td);
        tr.appendChild(td2);
        let reference = document.getElementsByTagName("tr").item(newIndis);
        reference.parentNode.insertBefore(tr, reference);

    } else {
        if (playerName != null){
            let tr = document.createElement("tr");
            let td = document.createElement("td");
            let td2 = document.createElement("td");
            let tda2 = document.createAttribute("data-id");
            tda2.value = queryId;
            let text1 = document.createTextNode(playerName);
            let text2 = document.createTextNode(score);
            td.appendChild(text1);
            td2.appendChild(text2);
            td2.setAttributeNode(tda2);
            tr.appendChild(td);
            tr.appendChild(td2);
            document.getElementsByTagName("table").item(0).append(tr);
        }
    }
}
function scaleToWindow(canvas, backgroundColor) {

    var scaleX, scaleY, scale, center;

    //1. Scale the canvas to the correct size
    //Figure out the scale amount on each axis
    scaleX = window.innerWidth / canvas.offsetWidth;
    scaleY = window.innerHeight / canvas.offsetHeight;

    //Scale the canvas based on whichever value is less: `scaleX` or `scaleY`
    scale = Math.min(scaleX, scaleY);
    canvas.style.transformOrigin = "0 0";
    canvas.style.transform = "scale(" + scale + ")";

    //2. Center the canvas.
    //Decide whether to center the canvas vertically or horizontally.
    //Wide canvases should be centered vertically, and
    //square or tall canvases should be centered horizontally
    if (canvas.offsetWidth > canvas.offsetHeight) {
        if (canvas.offsetWidth * scale < window.innerWidth) {
            center = "horizontally";
        } else {
            center = "vertically";
        }
    } else {
        if (Math.ceil(canvas.offsetHeight * scale) < window.innerHeight) {
            center = "vertically";
        } else {
            center = "horizontally";
        }
    }

    canvas.style.display = "inline-block";
    //Center horizontally (for square or tall canvases)
    var margin;
    if (center === "horizontally") {
        margin = (window.innerWidth - canvas.offsetWidth * scale) / 2;
        canvas.style.marginTop = 0 + "px";
        canvas.style.marginBottom = 0 + "px";
        canvas.style.marginLeft = margin + "px";
        canvas.style.marginRight = margin + "px";
    }

    //Center vertically (for wide canvases)
    if (center === "vertically") {
        margin = (window.innerHeight - canvas.offsetHeight * scale) / 2;
        canvas.style.marginTop = margin + "px";
        canvas.style.marginBottom = margin + "px";
        canvas.style.marginLeft = 0 + "px";
        canvas.style.marginRight = 0 + "px";
    }

    //3. Remove any padding from the canvas  and body and set the canvas
    //display style to "block"
    canvas.style.paddingLeft = 0 + "px";
    canvas.style.paddingRight = 0 + "px";
    canvas.style.paddingTop = 0 + "px";
    canvas.style.paddingBottom = 0 + "px";

    //4. Set the color of the HTML body background
    document.body.style.backgroundColor = backgroundColor;

    //Fix some quirkiness in scaling for Safari
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf("safari") != -1) {
        if (ua.indexOf("chrome") > -1) {
            // Chrome
        } else {
            // Safari
            //canvas.style.maxHeight = "100%";
            //canvas.style.minHeight = "100%";
        }
    }

    //5. Return the `scale` value. This is important, because you'll nee this value
    //for correct hit testing between the pointer and sprites
    return scale;
}


function scaleDivToWindow(id) {
    var scaleX, scaleY, scale, center;

    var div = document.getElementById(id);

    //1. Scale the canvas to the correct size
    //Figure out the scale amount on each axis

    scaleX = window.innerWidth / div.offsetWidth;
    scaleY = window.innerHeight / div.offsetHeight;

    //Scale the canvas based on whichever value is less: `scaleX` or `scaleY`
    scale = Math.min(scaleX, scaleY);
    div.style.transformOrigin = "0 0";
    div.style.transform = "scale(" + scale + ")";

    //2. Center the canvas.
    //Decide whether to center the canvas vertically or horizontally.
    //Wide canvases should be centered vertically, and
    //square or tall canvases should be centered horizontally
    if (div.offsetWidth > div.offsetHeight) {
        if (div.offsetWidth * scale < window.innerWidth) {
            center = "horizontally";
        } else {
            center = "vertically";
        }
    } else {
        if (Math.ceil(div.offsetHeight * scale) < window.innerHeight) {
            center = "vertically";
        } else {
            center = "horizontally";
        }
    }
    //Center horizontally (for square or tall canvases)
    var margin;
    if (center === "horizontally") {
        margin = (window.innerWidth - div.offsetWidth * scale) / 2;
        div.style.marginTop = 0 + "px";
        div.style.marginBottom = 0 + "px";
        div.style.marginLeft = margin + "px";
        div.style.marginRight = margin + "px";
    }

    //Center vertically (for wide canvases)
    if (center === "vertically") {
        margin = (window.innerHeight - div.offsetHeight * scale) / 2;
        div.style.marginTop = margin + "px";
        div.style.marginBottom = margin + "px";
        div.style.marginLeft = 0 + "px";
        div.style.marginRight = 0 + "px";
    }

    //3. Remove any padding from the canvas  and body and set the canvas
    //display style to "block"
    div.style.paddingLeft = 0 + "px";
    div.style.paddingRight = 0 + "px";
    div.style.paddingTop = 0 + "px";
    div.style.paddingBottom = 0 + "px";
    div.style.display = "block";

    //Fix some quirkiness in scaling for Safari
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf("safari") != -1) {
        if (ua.indexOf("chrome") > -1) {
            // Chrome
        } else {
            // Safari
            //canvas.style.maxHeight = "100%";
            //canvas.style.minHeight = "100%";
        }
    }
    //5. Return the `scale` value. This is important, because you'll nee this value
    //for correct hit testing between the pointer and sprites
    return scale;
}

//The `randomInt` helper function/*/
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//The `randomInt` helper function/*/
function randomFloat(min, max) {
    return (Math.random() * (max - min) + min).toFixed(3);
}

function getRandomPosition() {

    let x, y;

    let y_plus = 200;
    y = randomInt(80, y_plus);
    try {

        x = randomInt(-150, screenWidth + 150);

    } catch (e) {
        console.log(e)
    }

    return [x, -y];
}

document.getElementById("icoInput").addEventListener("input", function () {
    readIco(document.getElementById("icoInput").value);
});


function shareScore() {
    window.TelegramGameProxy.shareScore();
}

////////////////////////////Telegram Game.js\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

(function () {
    var eventHandlers = {};

    // Parse init params from location hash: for Android < 5.0, TDesktop
    var locationHash = '';
    try {
        locationHash = location.hash.toString();
    } catch (e) {
    }

    var initParams = urlParseHashParams(locationHash);

    var isIframe = false;
    try {
        isIframe = (window.parent != null && window != window.parent);
    } catch (e) {
    }


    function urlSafeDecode(urlencoded) {
        try {
            return decodeURIComponent(urlencoded);
        } catch (e) {
            return urlencoded;
        }
    }

    function urlParseHashParams(locationHash) {
        locationHash = locationHash.replace(/^#/, '');
        var params = {};
        if (!locationHash.length) {
            return params;
        }
        if (locationHash.indexOf('=') < 0 && locationHash.indexOf('?') < 0) {
            params._path = urlSafeDecode(locationHash);
            return params;
        }
        var qIndex = locationHash.indexOf('?');
        if (qIndex >= 0) {
            var pathParam = locationHash.substr(0, qIndex);
            params._path = urlSafeDecode(pathParam);
            locationHash = locationHash.substr(qIndex + 1);
        }
        var locationHashParams = locationHash.split('&');
        var i, param, paramName, paramValue;
        for (i = 0; i < locationHashParams.length; i++) {
            param = locationHashParams[i].split('=');
            paramName = urlSafeDecode(param[0]);
            paramValue = param[1] == null ? null : urlSafeDecode(param[1]);
            params[paramName] = paramValue;
        }
        return params;
    }

    // Telegram apps will implement this logic to add service params (e.g. tgShareScoreUrl) to game URL
    function urlAppendHashParams(url, addHash) {
        // url looks like 'https://game.com/path?query=1#hash'
        // addHash looks like 'tgShareScoreUrl=' + encodeURIComponent('tgb://share_game_score?hash=very_long_hash123')

        var ind = url.indexOf('#');
        if (ind < 0) {
            // https://game.com/path -> https://game.com/path#tgShareScoreUrl=etc
            return url + '#' + addHash;
        }
        var curHash = url.substr(ind + 1);
        if (curHash.indexOf('=') >= 0 || curHash.indexOf('?') >= 0) {
            // https://game.com/#hash=1 -> https://game.com/#hash=1&tgShareScoreUrl=etc
            // https://game.com/#path?query -> https://game.com/#path?query&tgShareScoreUrl=etc
            return url + '&' + addHash;
        }
        // https://game.com/#hash -> https://game.com/#hash?tgShareScoreUrl=etc
        if (curHash.length > 0) {
            return url + '?' + addHash;
        }
        // https://game.com/# -> https://game.com/#tgShareScoreUrl=etc
        return url + addHash;
    }


    function postEvent(eventType, callback, eventData) {
        if (!callback) {
            callback = function () {
            };
        }
        if (eventData === undefined) {
            eventData = '';
        }

        if (window.TelegramWebviewProxy !== undefined) {
            TelegramWebviewProxy.postEvent(eventType, JSON.stringify(eventData));
            callback();
        } else if (window.external && 'notify' in window.external) {
            window.external.notify(JSON.stringify({eventType: eventType, eventData: eventData}));
            callback();
        } else if (isIframe) {
            try {
                var trustedTarget = 'https://web.telegram.org';
                // For now we don't restrict target, for testing purposes
                trustedTarget = '*';
                window.parent.postMessage(JSON.stringify({eventType: eventType, eventData: eventData}), trustedTarget);
            } catch (e) {
                callback(e);
            }
        } else {
            callback({notAvailable: true});
        }
    };

    function receiveEvent(eventType, eventData) {
        var curEventHandlers = eventHandlers[eventType];
        if (curEventHandlers === undefined ||
            !curEventHandlers.length) {
            return;
        }
        for (var i = 0; i < curEventHandlers.length; i++) {
            try {
                curEventHandlers[i](eventType, eventData);
            } catch (e) {
            }
        }
    }

    function onEvent(eventType, callback) {
        if (eventHandlers[eventType] === undefined) {
            eventHandlers[eventType] = [];
        }
        var index = eventHandlers[eventType].indexOf(callback);
        if (index === -1) {
            eventHandlers[eventType].push(callback);
        }
    };

    function offEvent(eventType, callback) {
        if (eventHandlers[eventType] === undefined) {
            return;
        }
        var index = eventHandlers[eventType].indexOf(callback);
        if (index === -1) {
            return;
        }
        eventHandlers[eventType].splice(index, 1);
    };

    function openProtoUrl(url) {
        if (!url.match(/^(web\+)?tgb?:\/\/./)) {
            return false;
        }
        var useIframe = navigator.userAgent.match(/iOS|iPhone OS|iPhone|iPod|iPad/i) ? true : false;
        if (useIframe) {
            var iframeContEl = document.getElementById('tgme_frame_cont') || document.body;
            var iframeEl = document.createElement('iframe');
            iframeContEl.appendChild(iframeEl);
            var pageHidden = false;
            var enableHidden = function () {
                pageHidden = true;
            };
            window.addEventListener('pagehide', enableHidden, false);
            window.addEventListener('blur', enableHidden, false);
            if (iframeEl !== null) {
                iframeEl.src = url;
            }
            setTimeout(function () {
                if (!pageHidden) {
                    window.location = url;
                }
                window.removeEventListener('pagehide', enableHidden, false);
                window.removeEventListener('blur', enableHidden, false);
            }, 2000);
        } else {
            window.location = url;
        }
        return true;
    }

    // For Windows Phone app
    window.TelegramGameProxy_receiveEvent = receiveEvent;

    window.TelegramGameProxy = {
        initParams: initParams,
        receiveEvent: receiveEvent,
        onEvent: onEvent,
        shareScore: function () {
            postEvent('share_score', function (error) {
                if (error) {
                    var shareScoreUrl = initParams.tgShareScoreUrl;
                    if (shareScoreUrl) {
                        openProtoUrl(shareScoreUrl);
                    }
                }
            });
        }
    };

})();