'use strict';

export const API = {

    call(apiName, data, callback){
        const _xhr = new XMLHttpRequest();

        _xhr.onreadystatechange = function()
        {
            const READYSTATE_COMPLETED = 4;
            const HTTP_STATUS_OK = 200;
            if( this.readyState == READYSTATE_COMPLETED && this.status == HTTP_STATUS_OK ){
                console.log(this.responseText);
                callback(JSON.parse(this.responseText));
            }
        };
        _xhr.open("post", `./api/${apiName}.php`);
        _xhr.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded');
        _xhr.send(this._encodeHTMLForm(data));
    },
    
    _encodeHTMLForm( data ){
        var params = [];
        for( var name in data )
        {
            var value = data[ name ];
            var param = encodeURIComponent( name ) + '=' + encodeURIComponent( value );

            params.push( param );
        }

        return params.join( '&' ).replace( /%20/g, '+' );
    },
}