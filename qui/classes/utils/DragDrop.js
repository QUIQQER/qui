/**
 * DragDrop Helper with movable Element
 * no ie8
 *
 * @module qui/classes/utils/DragDrop
 * @author www.pcsg.de (Henning Leutz)
 *
 * @requires qui/classes/DOM
 *
 * @event onStart [ this, Dragable, event ]
 * @event onStop [ this, Dragable ]
 * @event onDrag [ this, Element, Droppable, event ]
 * @event onDrop [ this, Element, Droppable, event ]
 * @event onLeave [ this, Element, Droppable ]
 * @event onEnter [ this, Element, Droppable ]
 * @event onComplete [ this, event ]
 */

define(['qui/classes/DOM'], function(DOM)
{
    "use strict";

    /**
     * @class qui/classes/utils/DragDrop
     *
     * @param {DOMNode} Element - Which Element is dragable
     * @param {Object} options  - QDOM params
     */
    return new Class({

        Extends : DOM,
        Type    : 'qui/classes/utils/DragDrop',

        Binds : [
             '$complete',
             '$onDrag',
             '$onDrop',
             '$onLeave',
             '$onEnter'
        ],

        options :
        {
            dropables : [ document.body ],
            styles    : false,
            cssClass  : false,
            delay     : 500,     // when trigger the dragdrop, after miliseconds

            limit : {
                x : false, // [min, max]
                y : false  // [min, max]
            }
        },

        initialize : function(Elm, options)
        {
            var self = this;

            this.parent( options );

            this.$Drag    = null;
            this.$Element = Elm;
            this.$enable  = true;


            Elm.addEvents({

                mousedown : function(event)
                {
                    if ( !self.$enable ) {
                        return;
                    }

                    self.setAttribute( '_stopdrag', false );

                    self.$timer = self.$start.delay(
                        self.getAttribute('delay'),
                        self,
                        event
                    );

                    event.stop();
                },

                mouseup : function(event)
                {
                    if ( typeof self.$timer !== 'undefined' ) {
                        clearTimeout( self.$timer );
                    }

                    self.$stop( event );
                }
            });
        },

        /**
         * Return the binded Element
         *
         * @method qui/classes/utils/DragDrop#getElm
         * @return {DOMNode} Main Dom-Node Element
         */
        getElm : function()
        {
            return this.$Elm;
        },

        /**
         * Enable the DragDrop
         */
        enable : function()
        {
            this.$enable = true;
        },

        /**
         * Disable the DragDrop
         */
        disable : function()
        {
            this.$enable = false;
        },

        /**
         * Starts the draging by onmousedown
         *
         * @method qui/classes/utils/DragDrop#$start
         * @param {DOMEvent} event
         */
        $start : function(event)
        {
            if ( !this.$enable ) {
                return;
            }

            if ( event.rightClick ) {
                return;
            }

            if ( Browser.ie8 ) {
                return;
            }

            if ( this.getAttribute( '_mousedown') ) {
                return;
            }

            if ( this.getAttribute( '_stopdrag' ) ) {
                return;
            }

            this.setAttribute( '_mousedown', true );

            var i, len;

            var mx = event.page.x,
                my = event.page.y,

                Elm     = this.$Element,
                ElmSize = Elm.getSize(),
                limit   = this.getAttribute('limit'),
                docsize = document.body.getSize();

            // create the shadow element
            this.$Drag = new Element('div', {
                'class' : 'box',
                styles : {
                    position   : 'absolute',
                    top        : my - 20,
                    left       : mx - 40,
                    zIndex     : 1000,
                    MozOutline : 'none',
                    outline    : 0,
                    color      : '#fff',
                    padding    : 10,
                    cursor     : 'pointer',

                    width      : ElmSize.x,
                    height     : ElmSize.y,
                    background : 'rgba(0,0,0, 0.5)'
                }
            }).inject( document.body );

            if ( this.getAttribute( 'styles' ) ) {
                this.$Drag.setStyles( this.getAttribute( 'styles' ) );
            }

            if ( this.getAttribute( 'cssClass' ) ) {
                this.$Drag.addClass( this.getAttribute( 'cssClass' ) );
            }


            // set the drag&drop events to the shadow element
            // this.$Drag.addEvent( 'mouseup', this.$stop.bind( this ) );
            // document.body.addEvent( 'mouseup', this.$stop.bind( this ) );

            this.$Drag.focus();
            this.fireEvent( 'start', [ this, this.$Drag, event ] );

            // if no limit exist, set it to the body
            if ( !limit.x ) {
                limit.x = [ 0, docsize.x - this.$Drag.getSize().x ];
            }

            if ( !limit.y ) {
                limit.y = [ 0, docsize.y - this.$Drag.getSize().y ];
            }

            var dropables = this.getAttribute( 'dropables' );

            if ( typeOf( dropables ) === 'array' ) {
                dropables = dropables.join( ',' );
            }

            // mootools draging
            new Drag.Move(this.$Drag, {
                precalculate : true,

                droppables : dropables,
                onComplete : this.$complete,
                onDrop     : this.$onDrop,
                onEnter    : this.$onEnter,
                onLeave    : this.$onLeave,
                onDrag     : this.$onDrag,

                limit : limit

            }).start({
                page: {
                    x : mx,
                    y : my
                }
            });
        },

        /**
         * Stops the Draging by onmouseup
         *
         * @method qui/classes/utils/DragDrop#$stop
         */
        $stop : function()
        {
            if ( Browser.ie8 ) {
                return;
            }

            // Wenn noch kein mousedown drag getätigt wurde
            // mousedown "abbrechen" und onclick ausführen
            if ( !this.getAttribute( '_mousedown' ) )
            {
                this.setAttribute( '_stopdrag', true );
                return;
            }

            this.setAttribute( '_mousedown', false );

            if ( typeof this.$Drag !== 'undefined' || this.$Drag )
            {
                this.fireEvent( 'stop', [ this, this.$Drag ] );

                this.$Drag.destroy();
                this.$Drag = null;
            }
        },

        /**
         * Draging is complete
         *
         * @method qui/classes/utils/DragDrop#$complete
         * @param {DOMEvent} event
         */
        $complete : function(event)
        {
            this.fireEvent( 'complete', [ this, event ] );
            this.$stop();
        },

        /**
         * event: fired on every drag step
         *
         * @method qui/classes/utils/DragDrop#$onDrag
         * @param {DOMNode} Element
         * @param {DOMEvent} event
         */
        $onDrag : function(Element, event)
        {
            this.fireEvent( 'drag', [ this, Element, event ] );
        },

        /**
         * event: if the drag drop would be droped to a dopable
         *
         * @method qui/classes/utils/DragDrop#$onDrop
         * @param {DOMNode} Element
         * @param {DOMNode} Dropable
         * @param {DOMEvent} event
         */
        $onDrop : function(Element, Dropable, event)
        {
            this.fireEvent( 'drop', [ this, Element, Dropable, event ] );
        },

        /**
         * If the drag drop enters a dropable
         *
         * @method qui/classes/utils/DragDrop#$onDrop
         * @param {DOMNode} Element
         * @param {DOMNode} Dropable
         */
        $onEnter : function(Element, Dropable)
        {
            this.fireEvent( 'enter', [ this, Element, Dropable ] );
        },

        /**
         * If the drag drop leaves a dropable
         *
         * @method qui/classes/utils/DragDrop#$onLeave
         * @param {DOMNode} Element
         * @param {DOMNode} Dropable
         */
        $onLeave : function(Element, Dropable)
        {
            this.fireEvent( 'leave', [ this, Element, Dropable ] );
        }
    });
});
