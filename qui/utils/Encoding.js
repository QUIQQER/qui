
/**
 * Helper for encoding
 *
 * @module qui/utils/Encoding
 * @author www.pcsg.de (Henning Leutz)
 */

define('qui/utils/Encoding', {

    /**
     * UTF8 encode
     *
     * @method qui/utils/Encoding#encodeUTF8
     *
     * @param {String} rohtext
     * @return {String}
     */
    encodeUTF8 : function(rohtext)
    {
        // dient der Normalisierung des Zeilenumbruchs
        rohtext     = rohtext.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n=0; n<rohtext.length; n++)
        {
            // ermitteln des Unicodes des  aktuellen Zeichens
            var c=rohtext.charCodeAt(n);
            // alle Zeichen von 0-127 => 1byte
            if (c<128)
            {
                utftext += String.fromCharCode(c);
            } else if ((c>127) && (c<2048))
            {
                // alle Zeichen von 127 bis 2047 => 2byte
                utftext += String.fromCharCode((c>>6)|192);
                utftext += String.fromCharCode((c&63)|128);
            } else
            {
                // alle Zeichen von 2048 bis 66536 => 3byte
                utftext += String.fromCharCode((c>>12)|224);
                utftext += String.fromCharCode(((c>>6)&63)|128);
                utftext += String.fromCharCode((c&63)|128);
            }
        }

        return utftext;
    },

    /**
     * UTF8 Decode
     *
     * @method qui/utils/Encoding#decodeUTF8
     *
     * @param {String} utftext - UTF8 String
     * @return {String}
     */
    decodeUTF8 : function(utftext)
    {
        var i, c, c1, c2, c3;
        var plaintext = "";

        i = c = c1 = c2 = 0;

        while ( i < utftext.length )
        {
            c = utftext.charCodeAt( i );

            if ( c < 128 )
            {
                plaintext += String.fromCharCode( c );
                i++;
            } else if ( ( c > 191 ) && ( c < 224 ) )
            {
                c2 = utftext.charCodeAt( i+1 );
                plaintext += String.fromCharCode( ((c&31)<<6) | (c2&63) );
                i+=2;
            } else
            {
                c2 = utftext.charCodeAt( i+1 );
                c3 = utftext.charCodeAt( i+2 );

                plaintext += String.fromCharCode( ((c&15)<<12) | ((c2&63)<<6) | (c3&63) );
                i+=3;
            }
        }

        return plaintext;
    }
});
