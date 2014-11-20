
/**
 * Password Security Checker
 *
 * @module qui/controls/utils/PasswordSecurity
 * @author www.namerobot.com (Henning Leutz)
 */

define('qui/controls/utils/PasswordSecurity', [

    'qui/controls/Control',
    'qui/Locale',

    'qui/controls/utils/locale/de',
    'qui/controls/utils/locale/en',

    'css!qui/controls/utils/PasswordSecurity.css'

], function(QUIControl, Locale)
{
    "use strict";

    var lg = 'qui/controls/utils/PasswordSecurity';


    return new Class({

        Extends : QUIControl,
        Type    : 'qui/controls/utils/PasswordSecurity',

        Binds : [
            '$keyup',
            '$onInject'
        ],

        options : {
            styles : false
        },

        initialize : function(options, Input)
        {
            this.$Input = null;
            this.$Elm   = null;

            this.$delay = false;

            this.parent( options );

            this.addEvents({
                onInject : this.$onInject
            });

            if ( typeof Input !== 'undefined' ) {
                this.bindInput( Input );
            }
        },

        /**
         * Bind an input element to the security display
         *
         * @param {DOMNode} Input - input field <input />
         */
        bindInput : function(Input)
        {
            if ( this.$Input ) {
                this.$Input.removeEvent( 'keyup', this.$keyup );
            }

            this.$Input = Input;
            this.$Input.addEvent( 'keyup', this.$keyup );
            this.checkSecurity();
        },

        /**
         * Create the DOMNode Eement
         *
         * @return {DOMNode}
         */
        create : function()
        {
            this.$Elm = new Element('div', {
                'class': 'qui-utils-passwordsecurity'
            });

            this.$Elm.setStyles({
                width : 200
            });

            if ( this.getAttribute( 'styles' ) ) {
                this.$Elm.setStyles( this.getAttribute( 'styles' ) );
            }

            return this.$Elm;
        },

        /**
         * event : on inject
         */
        $onInject : function()
        {
            this.checkSecurity();
        },

        /**
         * event : key down
         */
        $keyup : function(event)
        {
            if ( this.$delay ) {
                clearTimeout( this.$delay );
            }

            this.$delay = this.checkSecurity.delay( 300, this );
        },

        /**
         * checks the security of the password input value
         */
        checkSecurity : function()
        {
            if ( !this.$Input ) {
                return;
            }

            var strength = this.getStrength( this.$Input.value );

            switch ( strength )
            {
                case 1:
                    this.$Elm.set({
                        html   : Locale.get( lg, 'html.password.strength1' ),
                        styles : {
                            background : '#ff0000',
                            color      : '#fff'
                        }
                    });
                break;

                case 2:
                    this.$Elm.set({
                        html   : Locale.get( lg, 'html.password.strength1' ),
                        styles : {
                            background : '#ff2c00',
                            color      : '#fff'
                        }
                    });
                break;

                case 3:
                    this.$Elm.set({
                        html   : Locale.get( lg, 'html.password.strength2' ),
                        styles : {
                            background : '#ff4d00',
                            color      : '#fff'
                        }
                    });
                break;

                case 4:
                    this.$Elm.set({
                        html   : Locale.get( lg, 'html.password.strength2' ),
                        styles : {
                            background : '#ff7300',
                            color      : '#fff'
                        }
                    });
                break;

                case 5:
                    this.$Elm.set({
                        html   : Locale.get( lg,  'html.password.strength2' ),
                        styles : {
                            background : '#ff9900',
                            color      : '#fff'
                        }
                    });
                break;

                case 6:
                    this.$Elm.set({
                        html   : Locale.get( lg, 'html.password.strength3' ),
                        styles : {
                            background : '#ffc700',
                            color      : '#000'
                        }
                    });
                break;

                case 7:
                    this.$Elm.set({
                        html   : Locale.get( lg, 'html.password.strength3' ),
                        styles : {
                            background : '#ffff00',
                            color      : '#000'
                        }
                    });
                break;

                case 8:
                    this.$Elm.set({
                        html   : Locale.get( lg, 'html.password.strength3' ),
                        styles : {
                            background : '#b6ff00',
                            color      : '#000'
                        }
                    });
                break;

                case 9:
                    this.$Elm.set({
                        html   : Locale.get( lg, 'html.password.strength4' ),
                        styles : {
                            background : '#53e200',
                            color      : '#000'
                        }
                    });
                break;

                case 10:
                    this.$Elm.set({
                        html   : Locale.get( lg, 'html.password.strength4' ),
                        styles : {
                            background : '#00e200',
                            color      : '#000'
                        }
                    });
                break;

                default:
                    this.$Elm.set({
                        html   : Locale.get( lg, 'html.password.strength1' ),
                        styles : {
                            background : '#ff0000',
                            color      : '#fff'
                        }
                    });
                break;
            }

        },

        /**
         * Return the strength of the password
         * main getStrength functionality from
         * http://benjaminsterling.com/password-strength-indicator-and-generator/
         *
         * @return {Integer} 0 - 9
         */
        getStrength : function(Pass)
        {
            var D      = Pass.length,
                length = D;

            if ( D > 5 ) {
                D = 5;
            }

            var F = Pass.replace( /[0-9]/g, "" ),
                G = length - F.length;

            if ( G > 3 ) {
                G = 3;
            }

            var A = Pass.replace( /[^a-zA-Z0-9]/g, "" ),
                C = length - A.length;

            if ( C > 3 ) {
                C = 3;
            }

            var B = Pass.replace( /[A-Z]/g, "" ),
                I = length - B.length;

            if ( I > 3 ) {
                I = 3;
            }

            var result = ( ( D * 10 ) - 20 ) + ( G * 10 ) + ( C * 15 ) + ( I * 10 );

            if ( result < 0 ) {
                result = 0;
            }


            if ( result > 100 ) {
                result = 100;
            }

            result = Math.ceil( result / 10 );

            // repeation
            // @todo use all repeat strings,
            // if more than one exist
            var repeation = Pass.match(/(.)\1+$/);

            if ( repeation && repeation[0] ) {
                result = result - repeation[0].length;
            }

            if ( result < 0 ) {
                result = 0;
            }

            return result;
        }
    });
});
