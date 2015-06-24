
/**
 * Param input field
 *
 * @module qui/controls/input/Params
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/controls/Control
 * @require qui/controls/buttons/Button',
 * @require qui/controls/windows/Confirm',
 * @require css!qui/controls/input/Params.css'
 */

define('qui/controls/input/Params', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/buttons/Button',
    'qui/controls/windows/Confirm',

    'css!qui/controls/input/Params.css'

], function(QUI, QUIControl, QUIButton, QUIConfirm)
{
    "use strict";

    /**
     * @class qui/controls/input/Params
     *
     * @memberof! <global>
     */
    return new Class({

        Extends : QUIControl,
        Type    : 'qui/controls/input/Params',

        Binds : [
            '$setValue',
            'openAddParamWindow'
        ],

        options : {
            name            : '',
            styles          : false, // optional -> style parameter
            allowedParams   : false, // optional {array} -> set which param names are allowed
            allowDuplicate  : false, // optional -> allow duplicate param entries
            windowMaxHeight : 360,   // optional -> the add window max height
            windowMaxWidth  : 540    // optional -> the add window max width
        },

        initialize : function(Input, options)
        {
            this.parent( options );

            this.$Input     = Input || null;
            this.$ParamList = null;
            this.$AddButton = null;

            if ( this.$Input ) {
                this.create();
            }
        },

        /**
         * Bind an input element to the control
         *
         * @method qui/controls/input/Params#bindElement
         * @param {HTMLElement} Input - Input Element
         */
        bindElement : function(Input)
        {
            var self = this;

            this.$Input = Input;
            this.$Input.type = 'hidden';

            this.$Input.addEvent('change', function() {
                self.$setValue( this.value );
            });

            return this;
        },

        /**
         * Create the DOMNode
         *
         * @method qui/controls/input/Params#create
         */
        create : function()
        {
            var self = this;

            this.$Elm = new Element('div', {
                'class' : 'qui-control-input-param box'
            });

            this.$ParamList = new Element('div', {
                'class' : 'qui-control-input-param-list box'
            });

            this.$AddButton = new QUIButton({
                textimage : 'icon-plus fa fa-plus',
                text : 'Parameter hinzufügen',
                events : {
                    onClick : this.openAddParamWindow
                },
                styles : {
                    clear : 'both',
                    margin: 0,
                    width: 230
                }
            });

            if ( !this.$Input )
            {
                this.$Input = new Element('input', {
                    name : this.getAttribute( 'name' )
                });

                this.$Elm.inject( this.$Elm );

            } else
            {
                this.$Elm.wraps( this.$Input );
            }

            this.$Input.type = 'hidden';
            this.$Input.addEvent('change', function() {
                self.$setValue( this.value );
            });

            if ( this.getAttribute( 'styles' ) ) {
                this.$ParamList.setStyles( this.getAttribute( 'styles' ) );
            }

            this.$AddButton.inject( this.$Elm );
            this.$ParamList.inject( this.$Elm );

            // display params
            this.$setValue( this.$Input.value );

            return this.$Elm;
        },

        /**
         * Set the value to the control
         * on Change event at the input field
         *
         * @method qui/controls/input/Params#$setValue
         * @param {String} value - JSON array string
         */
        $setValue : function(value)
        {
            var i, len;

            var jsonValue = JSON.decode( value );

            if ( typeOf( jsonValue ) != 'array' ) {
                jsonValue = [];
            }

            for ( i = 0, len = jsonValue.length; i < len; i++ )
            {
                if ( typeof jsonValue[ i ].name === 'undefined' ) {
                    continue;
                }

                if ( typeof jsonValue[ i ].value === 'undefined' ) {
                    continue;
                }

                this.addParam(
                    jsonValue[ i ].name,
                    jsonValue[ i ].value
                );
            }
        },

        /**
         * Return the values
         *
         * @method qui/controls/input/Params#getValue
         * @return {Array}
         */
        getValue : function()
        {
            var i, len, Elm;

            var list = this.$ParamList.getElements( '.qui-control-input-param-entry' ),
                data = [];

            for (i = 0, len = list.length; i < len; i++)
            {
                Elm = list[ i ];

                data.push({
                    name  : Elm.get( 'data-name' ),
                    value : Elm.get( 'data-value' )
                });
            }

            return data;
        },

        /**
         * Add a parameter to the list
         *
         * @method qui/controls/input/Params#addParam
         * @param {String} name - Name of the parameter
         * @param {String} value - Value of the parameter
         * @return {self}
         */
        addParam : function(name, value)
        {
            var self = this;

            var Elm = new Element('div', {
                'class'      : 'qui-control-input-param-entry box',
                html         : name +' : '+ value,
                "data-name"  : name,
                "data-value" : value,
                events :
                {
                    dblclick : function() {
                        self.openAddParamWindow( this );
                    }
                }
            }).inject( this.$ParamList );

            new QUIButton({
                icon : 'icon-remove fa fa-remove',
                styles : {
                    'float' : 'right',
                    lineHeight : 20,
                    margin : 0
                },
                events :
                {
                    onClick : function() {
                        Elm.destroy();
                    }
                }
            }).inject( Elm );

            return this;
        },

        /**
         * Open the add parameter sub window
         *
         * @method qui/controls/input/Params#openAddParamWindow
         * @param {HTMLElement} [Param] - optional, edit a param (.qui-control-input-param-entry)
         */
        openAddParamWindow : function(Param)
        {
            var self = this;

            new QUIConfirm({
                title     : 'Parameter hinzufügen',
                icon      : 'icon-plus fa fa-plus',
                maxHeight : this.getAttribute( 'windowMaxHeight' ),
                maxWidth  : this.getAttribute( 'windowMaxWidth' ),
                autoclose : false,

                text        : 'Geben Sie bitte den Namen und den Wert des Parameters ein.',
                information : '<div class="qui-control-input-param-window">' +
                                  '<label>' +
                                  '     <span class="qui-control-input-param-window-label">Name</span>' +
                                  '     <input type="text" name="paramName" value="" />' +
                                  '</label>' +
                                  '<label>' +
                                  '     <span class="qui-control-input-param-window-label">Wert</span>' +
                                  '     <input type="text" name="paramValue" value="" />' +
                                  '</label>' +
                              '</div>',

                events :
                {
                    onCreate : function(Confirm)
                    {
                        Confirm.getElm().addClass( 'qui-control-input-param-window' );
                    },

                    onOpen : function(Confirm)
                    {
                        var Content       = Confirm.getContent(),
                            ParamName     = Content.getElement( '[name="paramName"]' ),
                            ParamValue    = Content.getElement( '[name="paramValue"]' ),
                            allowedParams = self.getAttribute( 'allowedParams' );


                        if ( allowedParams.length )
                        {
                            var NameSelect = new Element('select', {
                                name : "paramName"
                            }).replaces( ParamName );

                            for ( var i = 0, len = allowedParams.length; i < len; i++ )
                            {
                                new Element('option', {
                                    value : allowedParams[ i ],
                                    html  : allowedParams[ i ]
                                }).inject( NameSelect );
                            }

                            ParamName = NameSelect;
                        }

                        Content.getElements('input,select').addEvents({
                            keyup : function(event)
                            {
                                if ( event.key === 'enter' ) {
                                    Confirm.submit();
                                }
                            }
                        });

                        if ( typeOf( Param ) === 'element' )
                        {
                            ParamName.value  = Param.get( 'data-name' );
                            ParamValue.value = Param.get( 'data-value' );
                        }

                        (function() {
                            ParamName.focus();
                        }).delay( 800 );
                    },

                    onSubmit : function(Confirm)
                    {
                        var Content    = Confirm.getContent(),
                            ParamName  = Content.getElement( '[name="paramName"]' ),
                            ParamValue = Content.getElement( '[name="paramValue"]' );

                        if ( ParamName.value === '' )
                        {
                            ParamName.focus();
                            return;
                        }

                        if ( ParamValue.value === '' )
                        {
                            ParamValue.focus();
                            return;
                        }

                        // if no duplicate params allowed, then check it
                        if ( !self.getAttribute( 'allowDuplicate' ) )
                        {
                            var result = self.$ParamList.getElements(
                                '[data-name="'+ ParamName.value +'"]'
                            );

                            if ( result.length )
                            {
                                QUI.getMessageHandler(function(MH)
                                {
                                    ParamName.focus();

                                    MH.addError(
                                        'Doppelte Parameter sind nicht erlaubt',
                                        ParamName
                                    );
                                });

                                return;
                            }
                        }

                        if ( typeOf( Param ) === 'element' )
                        {
                            // update param
                            Param.set( 'data-name', ParamName.value );
                            Param.set( 'data-value', ParamValue.value );

                            Param.set(
                                'html',
                                ParamName.value +' : '+ ParamValue.value
                            );

                        } else
                        {
                            // create param
                            self.addParam(
                                ParamName.value,
                                ParamValue.value
                            );
                        }

                        Confirm.close();
                    }
                }
            }).open();
        }
    });
});
