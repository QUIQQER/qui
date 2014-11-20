
/**
 * Makes an object unselectable or selectable
 *
 * @module qui/utils/NoSelect
 * @author www.pcsg.de (Henning Leutz)
 */

define('qui/utils/NoSelect', {

    /**
     * Enable the selection for an Element
     *
     * @method qui/utils/NoSelect#enable
     * @param {DOMNode} Elm - Element in which the mark / highlight is to be enabled
     */
    enable : function(Elm)
    {
        if ( typeof Elm.setProperty === 'undefined' ) {
            Elm = document.id( Elm );
        }

        Elm.removeClass( 'qui-utils-noselect' );

        if ( Browser.ie )
        {
            document.removeEvent( 'selectstart', this.stopSelection );
            return;
        }

        Elm.removeProperty( "unselectable", "on" );
        Elm.removeProperty( "unSelectable", "on" );

        Elm.setStyles({
            "MozUserSelect"   : "",
            "KhtmlUserSelect" : ""
        });
    },

    /**
     * Disable the selection for an Element
     *
     * @method qui/utils/NoSelect#disable
     * @param {DOMNode} Elm - Element in which the mark / highlight is to be prevented
     */
    disable : function(Elm)
    {
        if ( typeof Elm.setProperty === 'undefined' ) {
            Elm = document.id( Elm );
        }

        Elm.addClass( 'qui-utils-noselect' );

        if ( Browser.ie )
        {
            document.addEvent( 'selectstart', this.stopSelection );
            return;
        }

        Elm.setProperty( "unselectable", "on" );
        Elm.setProperty( "unSelectable", "on" );

        Elm.setStyles({
            "MozUserSelect"   : "none",
            "KhtmlUserSelect" : "none"
        });
    },

    /**
     * Stop selection for IE Browser
     *
     * @method qui/utils/NoSelect#stopSelection
     * @param {DOMEvent}
     */
    stopSelection : function(event)
    {
        event.stop();
        return false;
    }
});
