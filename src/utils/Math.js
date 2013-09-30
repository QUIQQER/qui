
/**
 * Math helper
 * Helps with math operations
 *
 * @author www.pcsg.de (Henning Leutz)
 */

define('qui/utils/Math', function()
{
    "use strict";

    return {

        /**
         * Resize Variables in dependence on each other
         *
         * @method qui/utils/Math#resizeVar
         *
         * @param {Integer} var1 - First variable
         * @param {Integer} var1 - Second variable
         * @param {Integer} max  - Max value of each variable
         *
         * @return {Object} Object {
         *     var1 : value,
         *     var2 : value
         * }
         */
        resizeVar : function(var1, var2, max)
        {
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
         * @return {Float}
         */
        parseAmountToFloat : function(str)
        {
            return parseFloat(
                str.toString().replace(',', '.')
            );
        },

        /**
         * Percent calculation
         * Return the percentage integer value
         *
         * @method qui/utils/Math#percent
         * @param Integer|Float $amount
         * @param Integer|Float $total
         *
         * @return {Integer}
         */
        percent : function(amount, total)
        {
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
         * @param {Float|Integer|Bool} brutto
         * @param {Float|Integer|Bool} netto
         * @param {Integer} mwst
         *
         * @return {Object} Object {
         *        brutto : brutto,
         *         netto : netto
         * }
         */
        calcMwst : function(brutto, netto, mwst)
        {
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
    };
});