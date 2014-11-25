
/**
 * Math helper
 * Helps with math operations
 *
 * @module qui/utils/Math
 * @author www.pcsg.de (Henning Leutz)
 */

define('qui/utils/Math', {

    /**
     * Resize Variables in dependence on each other
     *
     * @method qui/utils/Math#resizeVar
     *
     * @param {Number} var1 - First variable
     * @param {Number} var2 - Second variable
     * @param {Number} max  - Max value of each variable
     *
     * @return {Object} Object {
     *     var1 : value,
     *     var2 : value
     * }
     */
    resizeVar : function(var1, var2, max)
    {
        "use strict";

        var resize_by_percent;

        if ( var1 > max )
        {
            resize_by_percent = (max * 100 )/ var1;
            var2 = Math.round((var2 * resize_by_percent)/100);
            var1 = max;
        }

        if ( var2 > max )
        {
            resize_by_percent = (max * 100 )/ var2;
            var1 = Math.round((var1 * resize_by_percent)/100);
            var2 = max;
        }

        return {
            var1 : var1,
            var2 : var2
        };
    },

    /**
     * Parse an amount to a real float value
     *
     * @method qui/utils/Math#parseAmountToFloat
     *
     * @param {String} str - Value, String
     * @return {Number}
     */
    parseAmountToFloat : function(str)
    {
        "use strict";

        return parseFloat(
            str.toString().replace(',', '.')
        );
    },

    /**
     * Percent calculation
     * Return the percentage integer value
     *
     * @method qui/utils/Math#percent
     * @param {Number} amount
     * @param {Number} total
     *
     * @return {Number}
     */
    percent : function(amount, total)
    {
        "use strict";

        if (amount === 0 || total === 0) {
            return 0;
        }

        return ((amount * 100) / total).round();
    },

    /**
     * Calc a VAT
     *
     * @method qui/utils/Math#calcMwst
     *
     * @param {Number|Boolean} brutto
     * @param {Number|Boolean} netto
     * @param {Number} mwst
     *
     * @return {Object} Object {
     *     brutto : brutto,
     *     netto : netto
     * }
     */
    calcMwst : function(brutto, netto, mwst)
    {
        "use strict";

        mwst = (parseInt(mwst, 10) / 100) + 1;

        if (brutto === false)
        {
            brutto = netto * mwst;
        } else if (netto === false)
        {
            netto = brutto / mwst;
        }

        return {
            brutto : brutto,
            netto  : netto
        };
    }
});
