

describe("qui/classes/DOM", function()
{
    "use strict";

    it("qui/classes/DOM", function(done)
    {
        require(['qui/classes/DOM'], function(QDOM)
        {
            var na = {
                test1 : 'test1',
                test2 : 'test2'
            };

            var Obj = new QDOM( na );

            // Obj;
            expect( Obj.getAttribute('test1') ).toBe( 'test1' );
            expect( Obj.getAttribute('test2') ).toBe( 'test2' );

            var storageAttributes = Obj.getStorageAttributes();

            expect( JSON.encode(storageAttributes) ).toBe( JSON.encode(na) );


            done();
        });
    });
});