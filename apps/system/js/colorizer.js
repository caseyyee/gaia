'use strict';

/** 
 * Colarizer 
 * Observes the wallpaper.image setting and produces a color palette based on the blob image and creates/replaces palette settings.   
 * The color palette crated will have a nested array consisting of a base palette color and a additional scale of colors for each.
 */

var Colorizer = {
    BMP_SAMPLE_SIZE: {
        x: 20,
        y: 20
    },
    MAX_COLORS: 5,

    init: function c_init() {
        var self = this;
        this.initColors();
        var settings = navigator.mozSettings;
        settings.addObserver('wallpaper.image', function(event) {
            self.getWallpaperColors();
        });
    },

    initColors:  function c_initColors() {
        var self = this;
        var settings = navigator.mozSettings;
        var lock = settings.createLock();
        var reqWallpaperColors = lock.get('wallpaper.colors');
        
        
        reqWallpaperColors.onsuccess = function() {
            var wallpaperColors = this.result['wallpaper.colors'];    
            if (typeof wallpaperColors == 'undefined') {
                self.getWallpaperColors();
            } 
        }
    },

    getWallpaperColors: function c_getWallpaperColors() {
        var self = this;
        var settings = navigator.mozSettings;
        var lock = settings.createLock();
        var reqWallpaperImage = lock.get('wallpaper.image');
        reqWallpaperImage.onsuccess = function() {
            var wallpaperImage = this.result['wallpaper.image'];
            var img = new Image();
            img.onload = function() {
                var colors = self.getImageColors(img);
                navigator.mozSettings.createLock().set({
                    'wallpaper.colors': colors
                });
                console.log('colors set:'+colors);
            }
            img.src = window.URL.createObjectURL(wallpaperImage);
        }
    },

    getImageColors: function c_getImageColors(img) {
        // write image to canvas element
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
        for (var row = 0; row < this.BMP_SAMPLE_SIZE.x; row++) {
            y = parseInt((img.height/this.BMP_SAMPLE_SIZE.x)*row);
            for (var col = 0; col < this.BMP_SAMPLE_SIZE.y; col++) {
                x = parseInt((img.width/this.BMP_SAMPLE_SIZE.y)*col);
                var r = data[((img.width * y) + x) * 4];
                var g = data[((img.width * y) + x) * 4 + 1];
                var b = data[((img.width * y) + x) * 4 + 2];
                var a = data[((img.width * y) + x) * 4 + 3];
                colors.push([r, g, b]);
            }
        }
        // quantize colors in image down to MAX_COLORS
        var cmap = MMCQ.quantize(colors, this.MAX_COLORS);
        var palette = cmap.palette();
        // convert colors into chroma color object
        palette.forEach(function (color) {
            quantizedColorPalette.push( chroma.rgb(color).hex() );
        });

        return quantizedColorPalette;
    }
}

Colorizer.init();

