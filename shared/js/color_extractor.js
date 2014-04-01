// Colorizer

    'use strict';

    var ColorExtractor = (function() { 
        function ColorExtractor(img, opts, callback) {
            var self = this;
            if (!opts)
                var opts = {};
            if (!img)
                return false;
            var maxColors = opts.maxColors || 15;
            var bmpSampleSize = opts.bmpSampleSize || {
                x: 20,
                y: 20
            };
            
            var canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            var x, y;
            var colors = [];
            var quantizedColorPalette = [];
            var imageData = ctx.getImageData(0, 0, img.width, img.height);
            var data = imageData.data;

             // reduce samples taken from canvas to speed things up.
            for (var row = 0; row < bmpSampleSize.x; row++) {
                y = parseInt((img.height/bmpSampleSize.x)*row);
                for (var col = 0; col < bmpSampleSize.y; col++) {
                    x = parseInt((img.width/bmpSampleSize.y)*col);
                    var r = data[((img.width * y) + x) * 4];
                    var g = data[((img.width * y) + x) * 4 + 1];
                    var b = data[((img.width * y) + x) * 4 + 2];
                    var a = data[((img.width * y) + x) * 4 + 3];
                    colors.push([r, g, b]);
                }
            }


            // LazyLoader.load(['shared/js/colorizer/chroma.js', 'shared/js/colorizer/quantize.js'], function loaded() {
                 // quantize colors in image down to MAX_COLORS
                var cmap = MMCQ.quantize(colors, maxColors);
                var palette = cmap.palette();
                // convert colors into chroma color object
                palette.forEach(function (color) {
                    quantizedColorPalette.push( chroma.rgb(color).hex() );
                });

                callback(quantizedColorPalette);
            // });

    };

   return ColorExtractor;
})();
