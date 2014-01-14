var Wallpaper = {
    wallpapersUrl: '/resources/320x480/list.json',

    init: function wallpaper_init() {
        var self = this;
        if (navigator.mozSetMessageHandler) {
            navigator.mozSetMessageHandler('activity', function handler(request) {
                var activityName = request.source.name;
                if (activityName !== 'pick')
                    return;
                self.startPick(request);
            });
        }

        this.cancelButton = document.getElementById('cancel');
        this.wallpapers = document.getElementById('wallpapers');
        this.generateWallpaperList();
    },

    generateWallpaperList: function wallpaper_generateWallpaperList(cb) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', this.wallpapersUrl, true);
        xhr.responseType = 'json';
        xhr.send(null);

        var self = this;
        xhr.onload = function successGenerateWallpaperList() {
            self.wallpapers.innerHTML = '';
            xhr.response.forEach(function(wallpaper) {
                var div = document.createElement('div');
                div.classList.add('wallpaper');
                div.style.backgroundImage = 'url(resources/320x480/' + wallpaper + ')';
                self.wallpapers.appendChild(div);
            });
            if (cb) {
                cb();
            }
        };
    },

    startPick: function wallpaper_startPick(request) {
        this.pickActivity = request;
        this.wallpapers.addEventListener('click', this.pickWallpaper.bind(this));
        this.cancelButton.addEventListener('click', this.cancelPick.bind(this));
    },

    pickWallpaper: function wallpaper_pickWallpaper(e) {
        // Identify the wallpaper
        var backgroundImage = e.target.style.backgroundImage;
        var src = backgroundImage.match(/url\([\"']?([^\s\"']*)[\"']?\)/)[1];
        // Ignore clicks that are not on one of the images
        if (src == '')
            return;

        if (!this.pickActivity) {
            return;
        }

        var img = new Image();
        img.src = src;
        var self = this;
        img.onload = function() {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);

            var colorsArray = self.getImageColors(context, canvas.width, canvas.height, 15);

            canvas.toBlob(function(blob) {
                self.pickActivity.postResult({
                    type: 'image/jpeg',
                    blob: blob,
                    name: src,
                    colors: colorsArray,
                }, 'image/jpeg');

                self.endPick();
            }, 'image/jpeg');
        };
    },

    getImageColors: function wallpaper_getImageColors(context, imageWidth, imageHeight, colors) {
        var imageData = context.getImageData(0, 0, imageWidth, imageHeight);
        var data = imageData.data;
        var rows = 20;
        var cols = 20;


        var x, y;
        var bmpArray = [];
        var colorArray = [];

        for (var row = 0; row < rows; row++) {
            y = parseInt((imageHeight / rows) * row);
            for (var col = 0; col < cols; col++) {
                x = parseInt((imageWidth / cols) * col);
                var red = data[((imageWidth * y) + x) * 4];
                var green = data[((imageWidth * y) + x) * 4 + 1];
                var blue = data[((imageWidth * y) + x) * 4 + 2];
                var alpha = data[((imageWidth * y) + x) * 4 + 3];
                bmpArray.push([red, green, blue]);
            };
        };

        var cmap = MMCQ.quantize(bmpArray, colors);
        var palette = cmap.palette();

        var paletteLength = palette.length;
        for (var index = 0; index < paletteLength; index++) {
            colorArray.push(palette[index][0] + ',' + palette[index][1] + ',' + palette[index][2]);
        };

        return colorArray;
    },

    cancelPick: function wallpaper_cancelPick() {
        this.pickActivity.postError('cancelled');
        this.endPick();
    },

    endPick: function wallpaper_endPick() {
        this.pickActivity = null;
        this.cancelButton.removeEventListener('click', this.cancelPick);
        this.wallpapers.removeEventListener('click', this.pickWallpaper);
    }
};

window.addEventListener('load', function pick() {
    window.removeEventListener('load', pick);
    Wallpaper.init();
});