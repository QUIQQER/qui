
/**
 * Loading message
 *
 * @module qui/controls/messages/Loading
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/controls/messages/Message
 *
 * @event onFinish [ {self} ]
 */

define(['qui/controls/messages/Message'], function(Message)
{
    "use strict";

    /**
     * @class qui/controls/messages/Loading
     *
     * @memberof! <global>
     */
    return new Class({
        Extends : Message,
        Type    : 'qui/controls/messages/Loading',

        options: {
            message  : '',
            code     : 0,
            time     : false,
            cssclass : false,
            styles   : false,
            percent  : false
        },

        initialize : function(options)
        {
            this.setAttribute( 'cssclass', 'message-loading' );
            this.parent( options );
        },

        /**
         * Return the DOMNode of the message
         *
         * @method qui/controls/messages/Message#create
         * @return {DOMNode}
         */
        createMessageElement : function()
        {
            var Elm     = this.parent(),
                Message = Elm.getElement( '.messages-message-text' );

            new Element('span', {
                'class' : 'icon-spin icon-spinner fa fa-spinner fa-spin',
                styles  : {
                    marginRight : 10
                }
            }).inject( Message, 'top' );


            var Percent = new Element('span', {
                'class' : 'messages-message-percent',
                html    : '0%',
                styles  : {
                    marginRight : 10
                }
            }).inject( Message, 'top' );

            if ( this.getAttribute( 'percent' ) === false ) {
                Percent.setStyle( 'display', 'none' );
            }

            return Elm;
        },

        /**
         * Set the percent status to the element
         *
         * @param {Integer} percent - 0 - 100
         */
        setStatus : function(percent)
        {
            var i, len, Percent;

            for ( i = 0, len = this.$elements.length; i < len; i++ )
            {
                Percent = this.$elements[ i ].getElement( '.messages-message-percent' );

                if ( Percent ) {
                    Percent.set( 'html', ( percent ).toInt() +'%' );
                }
            }
        },

        /**
         * Finish the loading
         *
         * @param {String} msg  - finish message
         * @param {String} type - which message type is the loading message now?
         * 					      (attention, error, information, success) : default = success
         */
        finish : function(msg, type)
        {
            var i, len, Text;

            for ( var i = 0, len = this.$elements.length; i < len; i++ )
            {
                Text = this.$elements[ i ].getElement( '.messages-message-text' );
                Text.set( 'html', msg );

                switch ( type )
                {
                    case 'attention':
                    case 'error':
                    case 'information':
                    case 'success':
                        this.$elements[ i ].addClass( 'message-'+ type );
                        this.setAttribute( 'cssclass', 'message-'+ type );

                        this.Type = 'qui/controls/messages/'+ type.capitalize();

                    break;

                    default:
                        this.$elements[ i ].addClass( 'message-success' );
                        this.setAttribute( 'cssclass', 'message-success' );

                        this.Type = 'qui/controls/messages/Success';
                    break;
                }

                this.$elements[ i ].removeClass( 'message-loading' );
            }

            this.setAttribute( 'message', msg );
            this.fireEvent( 'finish', [ this ] );
        }
    });
});
