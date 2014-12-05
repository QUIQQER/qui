

describe("qui/classes/Controls", function()
{
    "use strict";

    it("qui/classes/Controls", function(done)
    {
        require(['qui/QUI'], function(QUI)
        {
            expect( QUI.Controls ).toBeDefined();
            expect( QUI.Controls.getById ).toBeDefined();

            done();
        });
    });
});