var express = require('express');
var router = express.Router();

router.get("/pump-your-coin", async function (request, response) {
    try {
        response.render('./pump-your-coin/game.ejs', {
            scores: []
        });
        return response;
    } catch (e) {
        response.send(e);
        console.log(e);
        return response;
    }
});

router.get("/:startParam", function (request, response) {
    console.log("/:startParam");
    response.redirect(`https://t.me/YOURBOT?start=${request.params.startParam}`);
});

module.exports = router;
