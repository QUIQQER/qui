
/**
 * A popup window
 *
 * @module qui/controls/windows/Popup
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/controls/Control
 * @require qui/controls/utils/Background
 * @require qui/controls/loader/Loader
 * @require qui/Locale
 * @require qui/utils/Controls
 * @require qui/controls/windows/locale/de
 * @require qui/controls/windows/locale/en
 * @require css!qui/controls/windows/Popup.css
 * @require css!qui/controls/buttons/Button.css
 *
 * @event onOpen [ self ]
 * @event onClose [ self ]
 * @event onCreate [ self ]
 * @event onResize [ self ]
 * @event onResizeBegin [ self ]
 */

define([

    'qui/controls/Control',
    'qui/controls/utils/Background',
    'qui/controls/loader/Loader',
    'qui/Locale',
    'qui/utils/Controls',

    'qui/controls/windows/locale/de',
    'qui/controls/windows/locale/en',

    'css!qui/controls/windows/Popup.css',
    'css!qui/controls/buttons/Button.css'

], function(Control, Background, Loader, Locale, Utils)
{
    "use strict";

    /**
     * @class qui/controls/windows/Popup
     *
     * @memberof! <global>
     */
    return new Class({

        Extends : Control,
        Type    : 'qui/controls/windows/Popup',

        Binds : [
            'resize',
            'cancel'
        ],

        options : {
            maxWidth  : 900,	// {integer} [optional]max width of the window
            maxHeight : 600,	// {integer} [optional]max height of the window
            content   : false,	// {string} [optional] content of the window
            icon      : false,	// {false|string} [optional] icon of the window
            title     : false,	// {false|string} [optional] title of the window
            'class'   : false,

            // buttons
            buttons          : true, // {bool} [optional] show the bottom button line
            closeButton      : true, // {bool} show the close button
            closeButtonText  : Locale.get( 'qui/controls/windows/Popup', 'btn.close' ),
            titleCloseButton : true  // {bool} show the title close button
        },

        initialize : function(options)
        {
            this.parent( options );

            this.$Elm        = null;
            this.$Content    = null;
            this.$Buttons    = null;

            this.Background = new Background();
            this.Loader     = new Loader();

            window.addEvent( 'resize', this.resize );
        },

        /**
         * Create the DOMNode Element
         *
         * @method qui/controls/windows/Popup#create
         * @return {DOMNode}
         */
        create : function()
        {
            if ( this.$Elm ) {
                return this.$Elm;
            }

            var self = this;

            this.$Elm = new Element('div', {
                'class' : 'qui-window-popup box',
                html    : '<div class="qui-window-popup-title box">'+
                              '<div class="qui-window-popup-title-icon"></div>' +
                              '<div class="qui-window-popup-title-text"></div>' +
                          '</div>' +
                          '<div class="qui-window-popup-content box"></div>'+
                          '<div class="qui-window-popup-buttons box"></div>',
                tabindex : -1
            });

            this.$Title     = this.$Elm.getElement( '.qui-window-popup-title' );
            this.$Icon      = this.$Elm.getElement( '.qui-window-popup-title-icon' );
            this.$TitleText = this.$Elm.getElement( '.qui-window-popup-title-text' );
            this.$Content   = this.$Elm.getElement( '.qui-window-popup-content' );
            this.$Buttons   = this.$Elm.getElement( '.qui-window-popup-buttons' );

            if ( this.getAttribute( 'titleCloseButton' ) )
            {
                new Element('div', {
                    'class' : 'icon-remove',
                    styles  : {
                        cursor : 'pointer',
                        'float' : 'right',
                        lineHeight: 17,
                        width : 17
                    },
                    events :
                    {
                        click : function() {
                            self.cancel();
                        }
                    }
                }).inject( this.$Title );
            }

            // icon
            var path = this.getAttribute( 'icon' );

            if ( path && Utils.isFontAwesomeClass( path )  )
            {
                this.$Icon.addClass( path );

            } else if ( path  )
            {
                new Element('img', {
                    src : path
                }).inject( this.$Icon );
            }

            // title
            if ( this.getAttribute( 'title' ) ) {
                this.$TitleText.set( 'html', this.getAttribute( 'title' ) );
            }

            if ( !this.getAttribute( 'title' ) && !this.getAttribute( 'icon' ) ) {
                this.$Title.setStyle( 'display', 'none' );
            }


            // bottom buttons
            if ( this.getAttribute( 'buttons' ) && this.getAttribute('closeButton') )
            {
                var Submit = new Element('button', {
                    html    : '<span>'+ this.getAttribute( 'closeButtonText' ) +'</span>',
                    'class' : 'qui-button btn-red',
                    events  : {
                        click : this.cancel
                    },
                    styles : {
                        display     : 'inline',
                        'float'     : 'none',
                        width       : 150,
                        textAlign   : 'center'
                    }
                }).inject( this.$Buttons );


                this.$Buttons.setStyles({
                    'float'   : 'left',
                    margin    : '0 auto',
                    textAlign : 'center',
                    width     : '100%'
                });
            }

            if ( this.getAttribute( 'content' ) ) {
                this.setContent( this.getAttribute( 'content' ) );
            }

            if ( this.getAttribute( 'class' ) ) {
                this.$Elm.addClass( this.getAttribute( 'class' ) );
            }

            this.Loader.inject( this.$Elm );

            this.fireEvent( 'create', [ this ] );

            return this.$Elm;
        },

        /**
         * Open the popup
         *
         * @method qui/controls/windows/Popup#open
         */
        open : function()
        {
            this.Background.create();

            this.Background.getElm().addEvent(
                'click',
                this.cancel
            );

            this.Background.show();
            this.inject( document.body );

            document.body.addClass( 'noscroll' );

            this.resize( true );
            this.fireEvent( 'open', [ this ] );
        },

        /**
         * Resize the popup
         *
         * @method qui/controls/windows/Popup#resize
         */
        resize : function(withfx)
        {
            if ( !this.$Elm ) {
                return;
            }

            withfx = withfx || false;


            this.fireEvent( 'resizeBegin', [ this ] );

            var self     = this,
                doc_size = document.body.getSize(),
                width    = Math.max( document.documentElement.clientWidth, window.innerWidth || 0 ),
                height   = Math.max( document.documentElement.clientHeight, window.innerHeight || 0 );

            if ( width > this.getAttribute( 'maxWidth' ) ) {
                width = this.getAttribute( 'maxWidth' );
            }

            if ( height > this.getAttribute( 'maxHeight' ) ) {
                height = this.getAttribute( 'maxHeight' );
            }

            var top  = ( doc_size.y - height ) / 2,
                left = doc_size.x * -1;

            if ( top < 0 ) {
                top = 0;
            }

            if ( left < 0 ) {
                left = 0;
            }

            this.$Elm.setStyles({
                height   : height,
                width    : width,
                left     : left,
                top      : top
            });

            if ( this.$Buttons )
            {
                // button zentrieren
                var list = this.$Buttons.getChildren();

                for ( var i = 0, len = list.length-1; i < len; i++ )
                {
                    if ( typeof list[ i ] === 'undefined' ) {
                        continue;
                    }

                    list[ i ].setStyle( 'marginRight', 10 );
                }

                if ( list.length )
                {
                    this.$Buttons.setStyles({
                        height : list[ 0 ].getComputedSize().totalHeight + 20
                    });
                }
            }

            // content height
            var content_height = height -
                                 this.$Buttons.getSize().y -
                                 this.$Title.getSize().y;

            this.$Content.setStyles({
                height : content_height
            });


            var left = ( doc_size.x - width ) / 2;

            if ( !withfx )
            {
                this.$Elm.setStyle( 'left', left );
                this.fireEvent( 'resize', [ this ] );

                return;
            }


            moofx( this.$Elm ).animate({
                left : left
            }, {
                callback : function()
                {
                    self.$Elm.focus();
                    self.fireEvent( 'resize', [ self ] );
                }
            });
        },

        /**
         * Close the popup
         *
         * @method qui/controls/windows/Popup#close
         */
        close : function()
        {
            window.removeEvent( 'resize', this.resize );

            if ( !this.$Elm ) {
                return;
            }

            var self = this;

            moofx( this.$Elm ).animate({
                left : document.getSize().x * -1
            }, {
                callback : function()
                {
                    self.fireEvent( 'close', [ self ] );

                    self.$Elm.destroy();
                    self.Background.destroy();

                    if ( !document.body.getElement( 'cls-background' ) ) {
                        document.body.removeClass( 'noscroll' );
                    }
                }
            });
        },

        /**
         * Close the popup and fire the cancel event
         *
         * @method qui/controls/windows/Popup#cancel
         */
        cancel : function()
        {
            this.fireEvent( 'cancel', [ this ] );
            this.close();
        },

        /**
         * Return the content DOMNode
         *
         * @method qui/controls/windows/Popup#getContent
         * @return {DOMNode} DIV
         */
        getContent : function()
        {
            return this.$Content;
        },

        /**
         * set the content of the popup
         *
         * @method qui/controls/windows/Popup#setContent
         * @return {String} html
         */
        setContent : function(html)
        {
            this.getContent().set( 'html', html );
        },

        /**
         * Add a Element to the button bar
         *
         * @method qui/controls/windows/Popup#addButton
         * @param {DOMNode} Elm
         * @return {this}
         */
        addButton : function(Elm)
        {
            if ( !this.$Buttons ) {
                return this;
            }

            var Node = Elm;

            Elm.inject( this.$Buttons, 'top' );

            if ( typeOf( Elm ) != 'element' ) {
                Node = Elm.getElm();
            }

            Node.setStyles({
                display : 'inline',
                'float' : 'none'
            });

            this.$Buttons.setStyles({
                height  : Node.getComputedSize().totalHeight
            });

            this.resize();

            return this;
        },

        /**
         * hide the button line
         *
         * @method qui/controls/windows/Popup#hideButtons
         * @return {this}
         */
        hideButtons : function()
        {
            if ( !this.$Buttons ) {
                return this;
            }

            this.$Buttons.setStyle( 'display', 'none' );
        },

        /**
         * show the button line
         *
         * @method qui/controls/windows/Popup#showButtons
         * @return {this}
         */
        showButtons : function()
        {
            if ( !this.$Buttons ) {
                return this;
            }

            this.$Buttons.setStyle( 'display', '' );
        },

        /**
         * create and open a new sheet
         *
         * @method qui/controls/windows/Popup#openSheet
         * @param {Function} onfinish - callback function
         */
        openSheet : function(onfinish)
        {
            var Sheet = new Element('div', {
                'class' : 'qui-window-popup-sheet box',
                html    : '<div class="qui-window-popup-sheet-content box"></div>' +
                          '<div class="qui-window-popup-sheet-buttons box">' +
                              '<div class="back button btn-white">' +
                                  '<span>' +
                                      Locale.get(
                                          'qui/controls/windows/Popup',
                                          'btn.back'
                                      ) +
                                  '</span>' +
                              '</div>' +
                          '</div>',
                styles : {
                    left : '-110%'
                }
            }).inject( this.$Elm  );

            Sheet.getElement( '.back' ).addEvent(
                'click',
                function() {
                    Sheet.fireEvent( 'close' );
                }
            );

            Sheet.addEvent('close', function()
            {
                moofx( Sheet ).animate({
                    left : '-100%'
                }, {
                    callback : function() {
                        Sheet.destroy();
                    }
                });
            });

            // heights
            var Content = Sheet.getElement( '.qui-window-popup-sheet-content' );

            Content.setStyles({
                height : Sheet.getSize().y - 80
            });



            // effect
            moofx( Sheet ).animate({
                left : 0
            }, {
                callback : function() {
                    onfinish( Content, Sheet );
                }
            });
        }
    });
});