/**
 * QUI Ajax Class
 *
 * Communication between server and client
 *
 * @author www.pcsg.de (Henning Leutz)
 *
 * @requires qui/classes/DOM
 * @requires qui/controls/messages/Handler
 *
 * @module qui/classes/request/Ajax
 */

define('qui/classes/request/Ajax', [

    'qui/QUI',
    'qui/classes/DOM',
    'qui/controls/messages/Error',
    'qui/Locale'

], function(QUI, DOM, MessageError, Locale)
{
    "use strict";

    /**
     * QUIQQER Ajax
     *
     * @class qui/classes/request/Ajax
     *
     * @fires onComplete [this]
     * @fires onSuccess [result, this]
     * @fires onProgress [this]
     * @fires onCancel [this]
     * @fires onDestroy [this]
     * @fires onError [qui/controls/messages/Error, this]
     *
     * @param {Object} options
     *
     * @memberof! <global>
     */
    return new Class({

        Extends : DOM,
        Type    : 'qui/classes/request/Ajax',

        Binds : [
            '$parseResult'
        ],

        $Request : null,
        $result  : null,

        options : {
            method : 'post',
            url    : '',
            async  : true
        },

        initialize : function(options)
        {
            this.parent( options );
        },

        /**
         * Send the Request
         *
         * @method qui/classes/request/Ajax#send
         *
         * @param {Object} params - Parameters which to be sent
         * @return {Request} Request Object
         */
        send : function(params)
        {
            var self = this;

            params = self.parseParams( params || {} );

            self.setAttribute( 'params', params );

            self.$Request = new Request({
                url    : self.getAttribute('url'),
                method : self.getAttribute('method'),
                async  : self.getAttribute('async'),

                onProgress : function(event, xhr) {
                    self.fireEvent( 'progress', [ self ] );
                },

                onComplete : function() {
                    self.fireEvent( 'complete', [ self ] );
                },

                onSuccess : self.$parseResult,

                onCancel : function() {
                    self.fireEvent( 'cancel', [ self ] );
                }
            });

            self.$Request.send( Object.toQueryString( params ) );

            return self.$Request;
        },

        /**
         * Cancel the Request
         *
         * @method qui/classes/request/Ajax#cancel
         */
        cancel : function()
        {
            this.$Request.cancel();
        },

        /**
         * Fires the onDestroy Event
         *
         * @method qui/classes/request/Ajax#destroy
         * @fires onDestroy
         */
        destroy : function()
        {
            this.fireEvent( 'destroy', [ this ] );
        },

        /**
         * If the Request is synchron, with getResult you can get the result from the request
         *
         * @method qui/classes/request/Ajax#getResult
         *
         * @return {unknown_type} result
         *
         * @example
         * Ajax.send( myparams );
         * var result = Ajax.getResult();
         */
        getResult : function()
        {
            return this.$result;
        },

        /**
         * Parse Params for the request
         * It filters undefined, objects and so on
         *
         * @method qui/classes/request/Ajax#parseParams
         *
         * @param {Object} params - params that will be send
         * @return {Object} Param list
         */
        parseParams : function(params)
        {
            var k, type_of;

            var result = {},
                value  = '';

            if ( typeof params.lang === 'undefined' &&
                 typeof Locale !== 'undefined' )
            {
                params.lang = Locale.getCurrent();
            }

            for ( k in params )
            {
                if ( typeof params[ k ] === 'undefined' ) {
                    continue;
                }

                type_of = typeOf( params[ k ] );

                if ( type_of != 'string' &&
                     type_of != 'number' &&
                     type_of != 'array' )
                {
                    continue;
                }

                if ( k != '_rf' && type_of == 'array' ) {
                    continue;
                }

                // if _rf is no array, make an array to it
                if ( k == '_rf' )
                {
                    if ( typeOf( params[ k ] ) != 'array' ) {
                        params[ k ] = [ params[ k ] ];
                    }

                    params[ k ] = JSON.encode( params[ k ] );
                }

                value = params[ k ].toString();
                value = value.replace(/\+/g, '%2B');
                value = value.replace(/\&/g, '%26');
                value = value.replace(/\'/g, '%27');

                result[ k ] = value;
            }

            return result;
        },

        /**
         * Parse the result and fire the Events
         *
         * @method qui/classes/request/Ajax#$parseResult
         * @param {String} responseText - request result
         * @param {String} responseXML
         *
         * if changes exists, please update the controls/upload/File.js
         *
         * @ignore
         */
        $parseResult : function(responseText, responseXML)
        {
            var i;

            var str   = responseText || '',
                len   = str.length,
                start = 9,
                end   = len-10;

            if ( !str.match('<quiqqer>') || !str.match('</quiqqer>') )
            {
                return this.fireEvent('error', [
                    new MessageError({
                        message : 'No QUIQQER XML',
                        code    : 500
                    }),
                    this
                ]);
            }

            if ( str.substring(0, start) != '<quiqqer>' ||
                 str.substring(end, len) != '</quiqqer>' )
            {
                return this.fireEvent('error', [
                    new MessageError({
                        message : 'No QUIQQER XML',
                        code    :  500
                    }),
                    this
                ]);
            }

            // callback
            var res, func;

            var result = eval( '('+ str.substring( start, end ) +')' ),
                params = this.getAttribute( 'params' ),
                rfs    = JSON.decode( params._rf || [] ),

                event_params = [];

            // exist messages?
            if ( result.message_handler &&
                 result.message_handler.length )
            {
                var messages = result.message_handler;

                QUI.getMessageHandler(function(MH)
                {
                    var i, len;

                    for ( i = 0, len = messages.length; i < len; i++ )
                    {
                        MH.parse( messages[ i ], function(Message) {
                            MH.add( Message );
                        });
                    }
                });
            }

            // exist a main exception?
            if ( result.Exception )
            {
                return this.fireEvent('error', [
                    new MessageError({
                        message : result.Exception.message || '',
                        code    : result.Exception.code || 0,
                        type    : result.Exception.type || 'Exception'
                    }),
                    this
                ]);
            }

            // check the single function
            for ( i = 0, len = rfs.length; i < len; i++ )
            {
                func = rfs[ i ];
                res  = result[ func ];

                if ( !res )
                {
                    event_params.push( null );
                    continue;
                }

                if ( res.Exception )
                {
                    this.fireEvent('error', [
                        new MessageError({
                            message : res.Exception.message || '',
                            code    : res.Exception.code || 0,
                            type    : res.Exception.type || 'Exception'
                        }),
                        this
                    ]);

                    event_params.push( null );
                    continue;
                }

                if ( res.result )
                {
                    event_params.push( res.result );
                    continue;
                }

                event_params.push( null );
            }

            event_params.push( this );

            this.fireEvent( 'success', event_params );
        }
    });
});