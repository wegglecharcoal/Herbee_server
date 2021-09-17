/**
 * Created by gunucklee on 2021. 09 10.
 */
module.exports = {
    name: function(filename) {
        const __filenameList = filename.split('/');
        return __filenameList[__filenameList.length - 1];
    },
}