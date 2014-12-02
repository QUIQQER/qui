
describe("qui/utils/Controls", function()
{
    "use strict";

    it("qui/utils/Controls", function(done)
    {
        require(['qui/utils/Controls'], function(ControlUtils)
        {
            expect( ControlUtils.isFontAwesomeClass('icon-home') ).toBe( true );
            expect( ControlUtils.isFontAwesomeClass('fa fa-home') ).toBe( true );

            expect( ControlUtils.isFontAwesomeClass('logo.png') ).toBe( false );


            done();
        });
    });
});
