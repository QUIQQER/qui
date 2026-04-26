describe("qui/controls/toolbar/Bar", function()
{
    "use strict";

    it("moves existing children without duplicates and keeps the DOM order in sync", function(done)
    {
        require([
            'qui/QUI',
            'qui/controls/toolbar/Bar',
            'qui/controls/buttons/Button'
        ], function(QUI, Toolbar, Button)
        {
            var Container = new Element('div').inject(document.body),
                Bar       = new Toolbar({
                    type          : 'buttons',
                    slide         : false,
                    'menu-button' : false
                }).inject(Container),
                Buttons   = [],
                Unknown;

            var getNames = function() {
                return Bar.getChildren().map(function(Button) {
                    return Button.getAttribute('name');
                });
            };

            var getDomNames = function() {
                return Bar.Tabs.getChildren().map(function(Elm) {
                    return QUI.Controls.getById(
                        Elm.get('data-quiid')
                    ).getAttribute('name');
                });
            };

            for (var i = 1; i <= 5; i++) {
                Buttons.push(new Button({
                    name: 'button-' + i,
                    text: 'Button ' + i
                }));

                Bar.appendChild(Buttons[i - 1]);
            }

            Bar.moveChildToPos(Buttons[4], 1);

            expect(getNames()).toEqual([
                'button-5',
                'button-1',
                'button-2',
                'button-3',
                'button-4'
            ]);
            expect(getDomNames()).toEqual(getNames());

            Bar.moveChildToPos(Buttons[4], 1);

            expect(getNames()).toEqual([
                'button-5',
                'button-1',
                'button-2',
                'button-3',
                'button-4'
            ]);
            expect(getDomNames()).toEqual(getNames());

            Bar.moveChildToPos(Buttons[4], 5);
            Bar.moveChildToPos(Buttons[1], 3);
            Bar.moveChildToPos(Buttons[0], 0);

            Unknown = new Button({name: 'unknown'});
            Bar.moveChildToPos(Unknown, 1);
            Unknown.destroy();

            expect(getNames()).toEqual([
                'button-1',
                'button-3',
                'button-2',
                'button-4',
                'button-5'
            ]);
            expect(getDomNames()).toEqual(getNames());
            expect(Bar.count()).toBe(5);

            Bar.destroy();
            Container.destroy();

            done();
        });
    });
});
