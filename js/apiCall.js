'use strict';

export const API = {

    call(apiName, data = {}, callback = (response)=>{}){
        const _xhr = new XMLHttpRequest();

        _xhr.onreadystatechange = function()
        {
            const READYSTATE_COMPLETED = 4;
            const HTTP_STATUS_OK = 200;
            if( this.readyState == READYSTATE_COMPLETED && this.status == HTTP_STATUS_OK ){
                let responseText = this.responseText;
                if(responseText == "")responseText = "{}"

                let responseObject = {};
                try {
                    responseObject = JSON.parse(responseText);
                } catch (error) {
                    console.log(responseText);
                    return;
                }
                callback(responseObject);
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