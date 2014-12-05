
describe("qui/utils/Form", function()
{
    "use strict";

    it("qui/utils/Form", function(done)
    {
        require(['qui/utils/Form'], function(FormUtils)
        {
            expect( FormUtils ).toBeDefined();
            expect( FormUtils.setDataToForm ).toBeDefined();
            expect( FormUtils.getFormData ).toBeDefined();

            var Form = new Element('form', {
                html : '<input type="text" name="text1" value="text" />'+
                       '<input type="text" name="text2" value="text" />'+

                       '<input type="checkbox" name="check1" checked />'+
                       '<input type="checkbox" name="check2" />'+

                       '<input type="checkbox" name="check3" value="1" checked />'+
                       '<input type="checkbox" name="check3" value="2" checked />'+
                       '<input type="checkbox" name="check3" value="3" />'+

                       '<input type="radio" name="radio1" value="1" checked />'+
                       '<input type="radio" name="radio1" value="2" checked />'+
                       '<input type="radio" name="radio1" value="3" />'
            });


            /**
             * getDataToForm test
             */
            var data = FormUtils.getFormData( Form );

            expect( data.text1 ).toBe( 'text' );
            expect( data.text2 ).toBe( 'text' );

            // checkboxes
            expect( data.check1 ).toBe( true );
            expect( data.check2 ).toBe( false );

            var check3 = data.check3;
            expect( typeOf( check3 ) ). toBe( 'array' );
            expect( check3[0] ). toBe( '1' );
            expect( check3[1] ). toBe( '2' );
            expect( check3.length ). toBe( 2 );

            // radio
            expect( data.radio1 ). toBe( '2' );

            /**
             * setDataToForm
             */
            FormUtils.setDataToForm({
                text1  : 'new value',
                check3 : [ "2", "3" ],
                radio1 : 3
            }, Form);

            data = FormUtils.getFormData( Form );

            expect( Form.elements.text1.value ). toBe( 'new value' );
            expect( data.text1 ). toBe( 'new value' );

            expect( Form.elements.radio1.value ). toBe( '3' );
            expect( data.radio1 ). toBe( '3' );

            console.log( data.check3 );

            done();
        });
    });
});
