/**
 * Submit Fenster
 *
 * @author www.pcsg.de (Henning Leutz)
 * @class QUI.controls.Windows.Prompt
 * @package com.pcsg.qui.js.controls.windows
 *
 * @event onSubmit [ value, this ]
 * @event onEnter [ value, this ]
 * @event onCancel [ this ]
 */

define('qui/controls/windows/Prompt', [

    'qui/controls/windows/Popup',
    'qui/controls/buttons/Button'

], function(Popup, Button)
{
    "use strict";

    /**
     * @class QUI.controls.windows.Prompt
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
        Type    : 'qui/controls/windows/Prompt',

        options: {
            'name'  : false,
            'title' : '',

            'width'  : false,
            'height' : false,
            'icon'   : 'icon-remove',
            'check'  : false, // function to check the input
            'autoclose' : true,

            'footerHeight' : false,

            'text'        : false,
            'texticon'    : false,
            'information' : false,

            cancel_button : {
                text      : 'Cancel',
                textimage : 'icon-remove'
            },
            ok_button : {
                text      : 'OK',
                textimage : 'icon-ok'
            }
        },

        Binds : [
            '$onCreate'
        ],

        initialize : function(options)
        {
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

            this.$Input = null;
            this.$Body  = null;

            this.addEvents({
                onCreate : this.$onCreate
            });
        },

        /**
         * oncreate event, create the prompt box
         */
        $onCreate : function(Win)
        {
            this.$Win = Win;

            var self    = this,
                Content = this.getContent(),
                html    = '';

            if ( this.getAttribute( 'texticon' ) ) {
                html = html +'<img src="'+ this.getAttribute( 'texticon' ) +'" class="texticon" />';
            }

            html = html +'<div class="textbody">';

            if ( this.getAttribute( 'text' ) ) {
                html = html +'<h2>'+ this.getAttribute( 'text' ) +'</h2>';
            }

            html = html +'<input type="text" value="" />';

            if ( this.getAttribute( 'information' ) ) {
                html = html +'<div class="information">'+ this.getAttribute( 'information' ) +'</div>';
            }

            html = html +'</div>';

            this.$Body = new Element('div.submit-body', {
                html   : html,
                styles : {
                    margin: 10
                }
            });

            this.$Input = this.$Body.getElement( 'input' );

            this.$Input.setStyles({
                width   : 250,
                margin  : '10px auto',
                display : 'block'
            });

            this.$Input.addEvent('keyup', function(event)
            {
                if ( event.key === 'enter' )
                {
                    self.fireEvent( 'enter', [ self.getValue(), self ] );
                    self.submit();
                }
            });

            this.$Body.inject( Content );


            // ondraw end
            if ( this.getAttribute( 'texticon' ) )
            {
                // damit das bild geladen wird und die proportionen da sind
                Asset.image(this.getAttribute('texticon'),
                {
                    onLoad: function()
                    {
                        var Texticon = self.$Body.getElement( '.texticon' ),
                            Textbody = self.$Body.getElement( '.textbody' );

                        Textbody.setStyle(
                            'width',
                            self.$Body.getSize().x - Texticon.getSize().x -20
                        );

                    }
                });
            }

            this.$Buttons.set( 'html', '' );

            this.addButton(
                new Button({
                    'class'   : 'btn-red',
                    text      : this.getAttribute( 'cancel_button' ).text,
                    textimage : this.getAttribute( 'cancel_button' ).textimage,
                    styles    : {
                        'float' : 'right',
                        width   : 150
                    },
                    events :
                    {
                        onClick : function(Btn)
                        {
                            self.fireEvent( 'cancel', [ self ] );
                            self.close();
                        }
                    }
                }).create()
            );

            this.addButton(
                new Button({
                    'class'   : 'btn-green',
                    text      : this.getAttribute( 'ok_button' ).text,
                    textimage : this.getAttribute( 'ok_button' ).textimage,
                    styles    : {
                        'float' : 'right',
                        width   : 150
                    },
                    events :
                    {
                        onClick : function(Btn) {
                            self.submit();
                        }
                    }
                }).create()
            );

            // focus after 200 miliseconds
            (function() {
                this.$Input.focus();
            }).delay(200, this);
        },

        /**
         * Return the DOMNode input field of the prompt
         * @returns {DOMNode}
         */
        getInput : function()
        {
            return this.$Input;
        },

        /**
         * Return the value
         * @return {String}
         */
        getValue : function()
        {
            if ( !this.getInput() ) {
                return '';
            }

            return this.getInput().value;
        },

        /**
         * Set the value of the prompt
         *
         * @param value
         * @return {this}
         */
        setValue : function(value)
        {
            if ( !this.getInput() ) {
                return this;
            }

            this.getInput().value = value;

            return this;
        },

        /**
         * Checks if a submit can be triggered
         *
         * @return {Boolean}
         */
        check : function()
        {
            if ( this.getAttribute( 'check' ) ) {
                return this.getAttribute( 'check' )( this );
            }

            if ( this.$Input.value === '' ) {
                return false;
            }

            return true;
        },

        /**
         * Submit the prompt window
         *
         * @return {Boolean}
         */
        submit : function()
        {
            if ( this.check() === false ) {
                return false;
            }

            this.fireEvent( 'submit', [ this.$Input.value, this ] );

            if ( this.getAttribute( 'autoclose' ) ) {
                this.close();
            }

            return true;
        }
    });
});
