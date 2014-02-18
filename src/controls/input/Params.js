/**
 * Param input field
 */

define('qui/controls/input/Params', [

    'qui/controls/Control',
    'qui/controls/buttons/Button',
    'qui/controls/windows/Confirm',

    'css!qui/controls/input/Params.css'

], function(QUIControl, QUIButton, QUIConfirm)
{
    "use strict";

    return new Class({

        Extends : QUIControl,
        Type    : 'qui/controls/input/Params',

        Binds : [
            'openAddParamWindow'
        ],

        options : {
            name : '',
            windowMaxHeight : 250, // optional -> the add window max height
            windowMaxWidth  : 400 // optional -> the add window max width
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
         * @param {DOMNode} Input - Input Element
         */
        bindElement : function(Input)
        {
            this.$Input = Input;
            this.$Input.type = 'hidden';

            return this;
        },

        /**
         * Create the DOMNode
         */
        create : function()
        {
            var i, len;


            this.$Elm = new Element('div', {
                'class' : 'qui-control-input-param box'
            });

            this.$ParamList = new Element('div', {
                'class' : 'qui-control-input-param-list box'
            });

            this.$AddButton = new QUIButton({
                icon   : 'icon-plus',
                title  : 'Parameter hinzufügen',
                events : {
                    onClick : this.openAddParamWindow
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

            var styles = this.$Input.getStyles('width', 'height', 'padding'),
                value  = this.$Input.value;

            this.$Input.type = 'hidden';
            this.$ParamList.setStyles( styles );


            this.$ParamList.inject( this.$Elm );
            this.$AddButton.inject( this.$Elm )

            // display params
            value = JSON.encode( value );

            if ( typeOf( value ) != 'array' ) {
                value = [];
            }

            for ( i = 0, len = value.length; i < len; i++ )
            {
                if ( !value[ i ].name ) {
                    continue;
                }

                if ( !value[ i ].value ) {
                    continue;
                }

                this.addParam(
                    value[ i ].name,
                    value[ i ].value
                );
            }

            return this.$Elm;
        },

        /**
         * Return the values
         *
         * @return {Array}
         */
        getValue : function()
        {
            var i, len, Elm;

            var list = this.$ParamList.getElements( '.qui-control-input-param-entry' ),
                data = [];

            for ( i = 0, len = list.length; i < len; i++ )
            {
                Elm = list[ i ];

                data.push({
                    name  : Elm.get( 'data-name' ),
                    value : Elm.get( 'data-value' )
                });
            }

            console.log( 'getValue' );
            console.log( data );

            return data;
        },

        /**
         * Add a parameter to the list
         *
         * @param {String} name - Name of the parameter
         * @param {String} value - Value of the parameter
         * @return {self}
         */
        addParam : function(name, value)
        {
            new Element('div', {
                'class'      : 'qui-control-input-param-entry box',
                html         : name +' : '+ value,
                "data-name"  : name,
                "data-value" : value
            }).inject( this.$ParamList );

            return this;
        },

        /**
         * Open the add parameter sub window
         */
        openAddParamWindow : function()
        {
            var self = this;

            new QUIConfirm({
                title  : 'Parameter hinzufügen',
                icon   : 'icon-plus',
                maxHeight   : this.getAttribute( 'windowMaxHeight' ),
                maxWidth    : this.getAttribute( 'windowMaxWidth' ),
                autoclose   : false,

                text : 'Geben Sie bitte den Namen und den Wert des Parameters ein.',
                information : '<div class="qui-control-input-param-window">' +
                                  '<label for="">Name</label>' +
                                  '<input type="text" name="paramName" value="" />' +
                                  '<label for="">Wert</label>' +
                                  '<input type="text" name="paramValue" value="" />' +
                              '</div>',

                events :
                {
                    onCreate : function(Confirm)
                    {
                        Confirm.getElm().addClass( 'qui-control-input-param-window' );
                    },

                    onOpen : function(Confirm)
                    {
                        var Content    = Confirm.getContent(),
                            ParamName  = Content.getElement( '[name="paramName"]' );

                        ParamName.focus();
                    },

                    onSubmit : function(Confirm)
                    {
                        var Content    = Confirm.getContent(),
                            ParamName  = Content.getElement( '[name="paramName"]' ),
                            ParamValue = Content.getElement( '[name="paramValue"]' );


                        if ( ParamName.value == '' ) {
                            return;
                        }

                        if ( ParamValue.value == '' ) {
                            return;
                        }

                        self.addParam(
                            ParamName.value,
                            ParamValue.value
                        );

                        Confirm.close();
                    }
                }
            }).open();
        }
    });

});