/**
 * The Main Class for the Main QUI Object
 *
 * @author www.pcsg.de (Henning Leutz)
 * @event onError : if there is an error
 */

define('qui/classes/QUI', [

    'require',
    'qui/classes/DOM',
    'qui/classes/Controls',

], function(require, DOM, Controls)
{
    "use strict";

    /**
     * The QUIQQER main object
     *
     * @class QUI
     * @memberof! <global>
     */
    return new Class({

        Extends : DOM,
        Type    : 'qui/classes/QUI',

        initialize : function(options)
        {
            /**
             * defaults
             */
            this.setAttributes({
                'debug'       : false,
                'fetchErrors' : true
            });

            this.parent( options );

            // error handling
            if ( this.getAttribute('fetchErrors') )
            {
                require.onError = function(requireType, requireModules)
                {
                    self.trigger(
                        'ERROR :'+ requireType +'\n'+
                        'Require :'+ requireModules
                    );
                };

                window.onerror = this.trigger.bind( this );
            }

            this.Controls       = new Controls();
            this.MessageHandler = null;
        },

        /**
         * Creates Namespaces
         * based on YAHOO code - nice solution!!
         *
         * @method qui/classes/QUI#namespace
         * @example QUI.namespace('my.name.space'); -> QUI.my.name.space
         * @depricated
         */
        namespace : function()
        {
            var tlen;

            var a = arguments,
                o = this,
                i = 0,
                j = 0,

                len  = a.length,
                tok  = null,
                name = null;

            // iterate on the arguments
            for ( ; i < len; i = i + 1 )
            {
                tok  = a[ i ].split( "." );
                tlen = tok.length;

                // iterate on the object tokens
                for ( j = 0; j < tlen; j = j + 1 )
                {
                    name = tok[j];
                    o[ name ] = o[ name ] || {};
                    o = o[ name ];
                }
            }

            return o;
        },

        /**
         * Fire the Error Event
         *
         * @method qui/classes/QUI#triggerError
         *
         * @param {QUI.classes.messages.Message|Exception} Exception - Exception Objekt
         * @param {Object} params    - Weitere Paramater (optional)
         * @return {this} self
         */
        triggerError : function(Exception, params)
        {
            this.fireEvent( 'onError', [ Exception, params ] );
            this.trigger( Exception.getMessage() );

            return this;
        },

        /**
         * trigger some messages to the console
         *
         * @method qui/classes/QUI#trigger
         *
         * @param {String} msg
         * @param {String} url
         * @param {Integer} linenumer
         *
         * @return {this} self
         */
        trigger : function(msg, url, linenumber)
        {
            var message = msg +"\n"+
                          "File: "+ url +"\n"+
                          "Linenumber: "+ linenumber;

            console.error( message );

            return this;
        },

        /**
         * Return the message handler
         *
         * @param {Function} callback
         */
        getMessageHandler : function(callback)
        {
            if ( this.MessageHandler )
            {
                callback( this.MessageHandler );
                return;
            }

            var self = this;

            require(['qui/controls/messages/Handler'], function(Handler)
            {
                self.MessageHandler = new Handler();

                callback( self.MessageHandler );
            });
        },

        /**
         * Return the message handler
         *
         * @param {Function} callback
         */
        getControls : function(callback)
        {
            if ( this.Controls )
            {
                callback( this.Controls );
                return;
            }


        }
    });
});
