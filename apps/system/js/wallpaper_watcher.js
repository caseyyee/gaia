'use strict';

/** 
Wallpaper change watcher
(this file)

Should be used to observe changes in wallpaper.image settings and set new colors palette.

Dependent on:
shared/color_extractor.js
shared/color_extractor/chroma.js
shared/color_extractor/quantize.js

To do: 
Create default color ranges.    Currently only creates palette on wallpaper changes.
 */

var WallpaperWatcher = {
    // foreground color 
    _foregroundColor: 'white',

    // minimum contrast between foreground color and background color
    _minContrast: 4.5,

    // brightest color
    _brightest: 20,

    // number of steps to brightest color
    _steps: 4,

    // lockscreen notifications container
    _notificationContainerId: 'lockscreen-notifications',

    init: function wch_init() {
        var settings = navigator.mozSettings;
        settings.addObserver('wallpaper.image', this.wallpaperImageChange)
    },

    wallpaperImageChange: function wch_wallpaperImageChange(value) {    
        var src = window.URL.createObjectURL(value.settingValue);
        var img = new Image();
        img.onload = function() { 
            // LazyLoader.load('shared/js/colorizer.js', function loaded() {
            //     console.log('lazy loaded colorizer');
                ColorExtractor(img, { colors: 5 }, WallpaperWatcher.addNotificationStyles);
            // });
        }
        img.src = src;
    },

    addNotificationStyles: function wch_addNotificationStyles(colors) {
        var style = document.getElementById(WallpaperWatcher._notificationContainerId);
        if (style) {
            style.innerHTML = "";
        } else {
            style = document.createElement('style');
            style.id = "lockscreen-notifications";
        }
        
        var color = WallpaperWatcher.pickContrastingColor(colors);
        
        // create a brighter versions of the same color.
        var steps = []; 
        for (var step = 0; step < WallpaperWatcher._steps; step++) {
            var amount = (WallpaperWatcher._brightest/WallpaperWatcher._steps)*step;
            steps.push( chroma(color).brighter(amount).hex() );
        }
        console.log(steps);

        // apply styles to sheet
        for (var i = 0; i < steps.length; i++) {
            var color = steps[i];
            
            if (i == steps.length-1) {
                var rule = "#notifications-lockscreen-container > div { background-color: "+color+"!important; opacity: 0.8; }";
            } else {
                var rule = "#notifications-lockscreen-container > div:nth-child("+(i+1)+") { background-color: "+color+"!important }";
            }
            style.appendChild(document.createTextNode(rule));    
        }
        
        document.head.appendChild(style);        
    },

    pickContrastingColor: function wch_pickContrastingColor(colors) {
        var highestContrast = 0;
        var highestContrastIndex = null;
        for (var i = 0; i < colors.length; i++) {
            var contrast = chroma.contrast(WallpaperWatcher._foregroundColor, colors[i]);
            if (contrast > WallpaperWatcher._minContrast)  {
                return colors[i];
                break;
            } else if (contrast > highestContrast) {
                highestContrast = contrast;
                highestContrastIndex = i;
            }
        }
        return colors[highestContrastIndex];
    }
}
WallpaperWatcher.init();


