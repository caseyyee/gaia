'use strict';

require('/shared/js/color_extractor.js');

suite('system/ColorExtractor', function() {
    test('Component initializes', function() {
        new ColorExtractor();
        assert.ok('everything should be ok');
    });
});