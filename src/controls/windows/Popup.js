
/**
 * A popup window
 *
 * @author www.pcsg.de (Henning Leutz)
 *
 * @event onOpen [ self ]
 * @event onClose [ self ]
 * @event onCreate [ self ]
 * @event onResize [ self ]
 * @event onResizeBegin [ self ]
 */

define('qui/controls/windows/Popup', [

    'qui/controls/Control',
    'qui/controls/utils/Background',
    'qui/controls/loader/Loader',
    'qui/Locale',
    'qui/utils/Controls',

    'qui/lib/moofx',
    'qui/controls/windows/locale/de',
    'qui/controls/windows/locale/en',

    'css!qui/controls/windows/Popup.css',
    'css!qui/controls/buttons/Button.css',
    'css!extend/buttons.css',
    'css!extend/classes.css'

], function(Control, Background, Loader, Locale, Utils)
{
    "use strict";

    return new Class({

        Extends : Control,
        Type    : 'classes/box/Popup',

        Binds : [
            'resize',
            'cancel'
        ],

        options : {
            maxWidth  : 900,	// {integer} [optional]max width of the window
            maxHeight : 600,	// {integer} [optional]max height of the window
            content   : false,	// {string} [optional] content of the window
            buttons   : true,	// {bool} [optional] show the bottom button line
            closeButtonText : Locale.get( 'qui/controls/windows/Popup', 'btn.close' ),
            icon      : false,	// {false|string} [optional] icon of the window
            title     : false,	// {false|string} [optional] title of the window
            'class'   : false
        },

        initialize : function(options)
        {
            this.parent( options );

            this.$Elm        = null;
            this.$Content    = null;
            this.$Buttons    = null;
            this.$Background = new Background();
            this.$Loader     = new Loader();

            window.addEvent( 'resize', this.resize );
        },

        /**
         * Create the DOMNode Element
         *
         * @return {DOMNode}
         */
        create : function()
        {
            this.$Elm = new Element('div', {
                'class' : 'qui-window-popup box',
                html    : '<div class="qui-window-popup-title box">'+
                              '<div class="qui-window-popup-title-icon"></div>' +
                              '<div class="qui-window-popup-title-text"></div>' +
                          '</div>' +
                          '<div class="qui-window-popup-content box"></div>'+
                          '<div class="qui-window-popup-buttons box"></div>'
            });

            this.$Title     = this.$Elm.getElement( '.qui-window-popup-title' );
            this.$Icon      = this.$Elm.getElement( '.qui-window-popup-title-icon' );
            this.$TitleText = this.$Elm.getElement( '.qui-window-popup-title-text' );
            this.$Content   = this.$Elm.getElement( '.qui-window-popup-content' );
            this.$Buttons   = this.$Elm.getElement( '.qui-window-popup-buttons' );

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
            if ( this.getAttribute( 'buttons' ) )
            {
                var Submit = new Element('div', {
                    html    : '<span>'+ this.getAttribute( 'closeButtonText' ) +'</span>',
                    'class' : 'qui-button btn-red',
                    events  : {
                        click : this.cancel
                    },
                    styles : {
                        marginRight : 20,
                        width       : 200,
                        textAlign   : 'center',
                        'float'     : 'left'
                    }
                }).inject(
                    this.$Buttons
                );

                this.$Buttons.setStyles({
                    width  : Submit.getSize().x,
                    margin : '0 auto'
                });
            }

            if ( this.getAttribute( 'content' ) ) {
                this.setContent( this.getAttribute( 'content' ) );
            }

            if ( this.getAttribute( 'class' ) ) {
                this.$Elm.addClass( this.getAttribute( 'class' ) );
            }

            this.$Loader.inject( this.$Elm );

            this.fireEvent( 'create', [ this ] );

            return this.$Elm;
        },

        /**
         * Open the popup
         */
        open : function()
        {
            this.$Background.create();

            this.$Background.getElm().addEvent(
                'click',
                this.cancel
            );

            this.$Background.show();


            this.inject( document.body );

            document.body.addClass( 'noscroll' );

            this.resize( true );
            this.fireEvent( 'open', [ this ] );
        },

        /**
         * Resize the popup
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
                width    = doc_size.x.toInt(),
                height   = doc_size.y;

            if ( width > this.getAttribute( 'maxWidth' ) ) {
                width = this.getAttribute( 'maxWidth' );
            }

            if ( height > this.getAttribute( 'maxHeight' ) ) {
                height = this.getAttribute( 'maxHeight' );
            }

            this.$Elm.setStyles({
                height   : height,
                width    : width,
                left     : doc_size.x * -1,
                top      : ( doc_size.y - height ) / 2
            });

            if ( this.$Buttons )
            {
                // button zentrieren
                var list   = this.$Buttons.getChildren(),
                    bwidth = 0;

                for ( var i = 0, len = list.length; i < len; i++ )
                {
                    bwidth = bwidth + list[ i ].getComputedSize({
                        styles : ['padding', 'border', 'margin']
                    }).totalWidth;
                }

                this.$Buttons.setStyles({
                    width  : bwidth,
                    margin : '0 auto'
                });
            }

            this.$Buttons.setStyle( 'float', 'left' );

            // content height
            var content_height = height -
                                 this.$Buttons.getSize().y -
                                 this.$Title.getSize().y;

            this.$Content.setStyles({
                height : content_height
            });

            this.$Buttons.setStyle( 'float', null );


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
                callback : function() {
                    self.fireEvent( 'resize', [ self ] );
                }
            });
        },

        /**
         * Close the popup
         */
        close : function()
        {
            window.removeEvent( 'resize', this.resize );

            if ( !this.$Elm ) {
                return;
            }

            var self = this;

            moofx( self.$Elm ).animate({
                left : document.getSize().x * -1
            }, {
                callback : function()
                {
                    self.fireEvent( 'close', [ self ] );

                    self.$Elm.destroy();
                    self.$Background.destroy();

                    if ( !document.body.getElement( 'cls-background' ) ) {
                        document.body.removeClass( 'noscroll' );
                    }

                }
            });
        },

        /**
         * Close the popup and fire the cancel event
         */
        cancel : function()
        {
            this.fireEvent( 'cancel', [ this ] );
            this.close();
        },

        /**
         * Return the content DOMNode
         *
         * @return {DOMNode} DIV
         */
        getContent : function()
        {
            return this.$Content;
        },

        /**
         * set the content of the popup
         *
         * @return {String} html
         */
        setContent : function(html)
        {
            this.getContent().set( 'html', html );
        },

        /**
         * Add a Element to the button bar
         *
         * @param {DOMNode} Elm
         * @return {this}
         */
        addButton : function(Elm)
        {
            if ( !this.$Buttons ) {
                return;
            }

            Elm.inject( this.$Buttons );

            // button zentrieren
            var list  = this.$Buttons.getChildren(),
                width = 0;

            for ( var i = 0, len = list.length; i < len; i++ )
            {
                width = width + list[ i ].getComputedSize({
                    styles : ['padding','border', 'margin']
                }).totalWidth;
            }

            this.$Buttons.setStyles({
                width  : width,
                margin : '0 auto'
            });

            return this;
        },

        /**
         * create and open a new sheet
         *
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