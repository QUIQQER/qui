/**
 * Submit Fenster
 *
 * @fires onSubmit
 * @fires onCancel
 *
 * @author www.namerobot.com (Henning Leutz)
 *
 * @class qui/controls/windows/Submit
 * @package com.pcsg.qui.js.controls.windows
 */

define('qui/controls/windows/Confirm', [

    'qui/controls/windows/Popup',
    'qui/controls/buttons/Button',
    'qui/utils/Controls',
    'css!qui/controls/windows/Confirm.css'

], function(Popup, Button, Utils)
{
    "use strict";

    /**
     * @class QUI.controls.windows.Submit
     *
     * @fires onDrawEnd
     * @fires onClose
     *
     * @param {Object} options
     *
     * @memberof! <global>
     */
    return new Class({

        Extends : Popup,
        Type    : 'qui/controls/windows/Confirm',

        Binds : [
            '$onOpen'
        ],

        options: {
            'maxHeight' : 300,
            'autoclose' : true,

            'information' : false,
            'title'       : '...',
            'titleicon'   : 'icon-remove',
            'icon'        : 'icon-remove',

            cancel_button : {
                text      : 'Cancel',
                textimage : 'icon-remove'
            },
            ok_button : {
                text      : 'OK',
                textimage : 'icon-ok'
            }
        },

        initialize : function(options)
        {
            var self = this;

            this.parent( options );

            // defaults
            if ( this.getAttribute( 'name' ) === false ) {
                this.setAttribute( 'name', 'win'+ new Date().getMilliseconds() );
            }

            if ( this.getAttribute( 'width' ) === false ) {
                this.setAttribute( 'width', 500 );
            }

            if ( this.getAttribute( 'height' ) === false ) {
                this.setAttribute( 'height', 240 );
            }

            // on set attribute event
            // if attributes were set after creation
            this.addEvent('onSetAttribute', function(attr, value)
            {
                if ( !self.$Body.getElement( '.textbody' ) ) {
                    return;
                }

                if ( attr == 'texticon' )
                {
                    var Texticon = self.$Body.getElement( '.texticon' ),
                        Textbody = self.$Body.getElement( '.textbody' );

                    if ( !Texticon )
                    {
                        Texticon = new Element( 'div.texticon' );
                        Texticon.inject( Textbody, 'before' );
                    }

                    Textbody.set({
                        styles : {
                            width    : self.$Body.getSize().x - Node.width - 20,
                            fontSize : null
                        },
                        src : null
                    });

                    Texticon.className = 'texticon';

                    if ( Utils.isFontAwesomeClass( value ) )
                    {
                        Texticon.addClass( value );
                        Texticon.setStyles({
                            fontSize : 50
                        });
                    } else
                    {
                        Texticon.src = value;
                    }

                    return;
                }

                if ( attr == 'information' )
                {
                    self.$Body
                        .getElement( '.information' )
                        .set( 'html', value );

                    return;
                }

                if ( attr == 'text' )
                {
                    self.$Body
                        .getElement('.text')
                        .set( 'html', value );

                    return;
                }
            });


            this.addEvent( 'onOpen', this.$onOpen );

            this.$Body    = null;
            this.$Win     = null;
            this.$Buttons = null;
        },

        /**
         * Create the body for the submit window
         *
         * @method QUI.controls.windows.Submit#onCreate
         * @ignore
         */
        $onOpen : function()
        {
            var Body;

            var Content = this.getContent(),
                html    = '';

            Content.setStyles({
                padding: 20
            });

            this.$Body = new Element('div.submit-body', {
                html   : '<div class="textbody">' +
                             '<h2 class="text">&nbsp;</h2>' +
                             '<div class="information">&nbsp;</div>' +
                         '</div>',
                styles : {
                    'float': 'left',
                    width  : '100%'
                }
            });

            this.$Body.inject( Content );

            if ( this.getAttribute( 'texticon' ) ) {
                this.setAttribute( 'texticon', this.getAttribute( 'texticon' ) );
            }

            if ( this.getAttribute( 'text' ) ) {
                this.setAttribute( 'text', this.getAttribute( 'text' ) );
            }

            if ( this.getAttribute( 'information' ) ) {
                this.setAttribute( 'information', this.getAttribute( 'information' ) );
            }

            this.addButton(
                new Button({
                    text      : this.getAttribute( 'ok_button' ).text,
                    textimage : this.getAttribute( 'ok_button' ).textimage,
                    Win       : this,
                    styles    : {
                        'float' : 'right',
                        width   : 150
                    },
                    events :
                    {
                        onClick : function(Btn) {
                            Btn.getAttribute( 'Win' ).submit();
                        }
                    }
                })
            );
        },

        /**
         * Submit the window
         *
         * @method QUI.controls.windows.Submit#submit
         */
        submit : function()
        {
            this.fireEvent( 'submit', [ this ] );

            if ( this.getAttribute( 'autoclose' ) ) {
                this.close();
            }
        }
    });
});