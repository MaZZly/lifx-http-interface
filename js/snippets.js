// From: http://stackoverflow.com/questions/2153917/how-to-send-a-put-delete-request-in-jquery
/* Extend jQuery with functions for PUT and DELETE requests. */
function _ajax_request(url, data, callback, type, method) {
    if (jQuery.isFunction(data)) {
        callback = data;
        data = {};
    }
    return jQuery.ajax({
        type: method,
        url: url,
        data: data,
        success: callback,
        dataType: type
    });
}

jQuery.extend({
    put: function (url, data, callback, type) {
        return _ajax_request(url, data, callback, type, 'PUT');
    },
    delete_: function (url, data, callback, type) {
        return _ajax_request(url, data, callback, type, 'DELETE');
    }
});



// From:http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
// Modified a bit to return objects instead of arrays
function rgbToHsb(r, g, b) {
    r = r / 255, g = g / 255, b = b / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if (max == min) {
        h = 0; // achromatic
    } else {
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return {
        hue: h,
        sat: s,
        bri: v
    }
}

function hsbToRgb(h, s, b) {
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = b * (1 - s);
    var q = b * (1 - f * s);
    var t = b * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0:
            r = b, g = t, b = p;
            break;
        case 1:
            r = q, g = b, b = p;
            break;
        case 2:
            r = p, g = b, b = t;
            break;
        case 3:
            r = p, g = q, b = b;
            break;
        case 4:
            r = t, g = p, b = b;
            break;
        case 5:
            r = b, g = p, b = q;
            break;
    }

    return {
        red: r*255,
        green: g*255,
        blue: b*255
    }
}

function rgbToHex(r,g,b) {
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).substr(1);
}