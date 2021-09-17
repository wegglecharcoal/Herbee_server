/**
 * Created by gunucklee on 2021. 09. 09
 */
const errCode = require('../define/errCode');

let self;
self = module.exports = {

    get: function( err ) {
        let _stack = ( err instanceof Error ) ? '' : ( err.stack ? err.stack : err );
        let _msg = ( err instanceof Error ) ? err.message : err;
        let _code = ( err instanceof Error ) ? err.code : errCode.system;

        return ( err instanceof Error ) ? err : self.initError( _code, _msg, _stack );
    },

    initError: function ( code, msg, stack = '' ) {
        let _err = new Error();
        _err.code = code;
        _err.message = msg;
        _err.stack = stack;

        return _err;
    },

    createCall: function( code, msg, stack = '' ) {
        let text = typeof msg === 'string' ? msg : String( msg );
        let _err = self.initError(code, text, stack);
        throw _err;
    }
}