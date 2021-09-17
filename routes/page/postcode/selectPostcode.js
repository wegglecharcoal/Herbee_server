/**
 * Created by gunucklee on 2021. 06. 01.
 */
module.exports = function (req, res, next) {
    try {
        res.render('postcode.ejs');
    }
    catch (e){
        console.log(`==>> e: ${JSON.stringify(e)}`);
    }
};