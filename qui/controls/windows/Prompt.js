
/**
 * Submit Fenster
 *
 * @module qui/controls/windows/Prompt
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/controls/windows/Popup
 * @require qui/controls/buttons/Button
 * @require qui/utils/Controls
 * @require css!qui/controls/windows/Prompt.css
 *
 * @event onSubmit [ value, this ]
 * @event onEnter [ value, this ]
 * @event onCancel [ this ]
 */

define([

    'qui/controls/windows/Popup',
    'qui/controls/buttons/Button',
    'qui/utils/Controls',

    'css!qui/controls/windows/Prompt.css'

], function(Popup, Button, Utils)
{
    "use strict";

    /**
     * @class qui/controls/windows/Prompt
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
            'maxHeight' : 300,

            'check'     : false, // function to check the input
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

        Binds : [
            '$onCreate',
            '$onOpen'
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
                onCreate : this.$onCreate,
                onOpen   : this.$onOpen
            });
        },

        /**
         * oncreate event, create the prompt box
         */
        $onCreate : function()
        {
            var self    = this,
                Content = this.getContent();

            Content.set(
                'html',

                '<div class="qui-windows-prompt">' +
                    '<div class="qui-windows-prompt-icon"></div>' +
                    '<div class="qui-windows-prompt-text"></div>' +
                    '<div class="qui-windows-prompt-information"></div>' +
                '</div>' +
                '<div class="qui-windows-prompt-input">'+
                    '<input type="text" value="" class="box" />' +
                '</div>'
            );

            this.$Icon = Content.getElement( '.qui-windows-prompt-icon' );
            this.$Text = Content.getElement( '.qui-windows-prompt-text' );
            this.$Info = Content.getElement( '.qui-windows-prompt-information' );

            this.$Container = Content.getElement( '.qui-windows-prompt' );
            this.$Input     = Content.getElement( 'input' );


            if ( this.getAttribute( 'titleicon' ) )
            {
                var value = this.getAttribute( 'titleicon' );

                if ( Utils.isFontAwesomeClass( value ) )
                {
                    new Element('span', {
                        'class' : value
                    }).inject( this.$Icon );
                } else
                {
                    new Element('img.qui-windows-prompt-image', {
                        src    : value,
                        styles : {
                            'display' : 'block' // only image, fix
                        }
                    }).inject( this.$Icon );
                }
            }

            if ( this.getAttribute( 'title' ) ) {
                this.$Text.set( 'html', this.getAttribute( 'title' ) );
            }

            if ( this.getAttribute( 'information' ) ) {
                this.$Info.set( 'html', this.getAttribute( 'information' ) );
            }

            // input events
            this.$Input = Content.getElement( 'input' );

            this.$Input.addEvent('keyup', function(event)
            {
                if ( event.key === 'enter' )
                {
                    self.fireEvent( 'enter', [ self.getValue(), self ] );
                    self.submit();
                }
            });

            this.$Container.setStyle(
                'height',
                this.getAttribute( 'maxHeight' ) - 190
            );


            // ondraw end
//            if ( this.getAttribute( 'texticon' ) )
//            {
//                this.getAttribute('texticon')
//
//
//                // damit das bild geladen wird und die proportionen da sind
//                Asset.image(this.getAttribute('texticon'),
//                {
//                    onLoad: function()
//                    {
//                        var Texticon = self.$Body.getElement( '.texticon' ),
//                            Textbody = self.$Body.getElement( '.textbody' );
//
//                        Textbody.setStyle(
//                            'width',
//                            self.$Body.getSize().x - Texticon.getSize().x -20
//                        );
//
//                    }
//                });
//            }

            this.$Buttons.set( 'html', '' );

            this.addButton(
                new Button({
                    text      : this.getAttribute( 'cancel_button' ).text,
                    textimage : this.getAttribute( 'cancel_button' ).textimage,
                    styles    : {
                        width : 150
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
                    text      : this.getAttribute( 'ok_button' ).text,
                    textimage : this.getAttribute( 'ok_button' ).textimage,
                    styles    : {
                        width : 150
                    },
                    events :
                    {
                        onClick : function(Btn) {
                            self.submit();
                        }
                    }
                }).create()
            );
        },

        /**
         * event : on open
         */
        $onOpen : function()
        {
            // focus after 500 miliseconds
            (function() {
                this.$Input.focus();
            }).delay( 700, this );
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
