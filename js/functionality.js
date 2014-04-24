var lifx = {
    base_url: window.localStorage['base_url'] ? window.localStorage['base_url'] : 'http://localhost:56780/',
    tags: [],
    lights: [],
    getLights: function () {
        $.get(this.base_url + 'lights.json', function (response) {
//            Go through all the lights
                lifx.lights = response
                $('#lightList').empty()
                $.each(response, function (i, light) {
                    var toggle = $('<input>').attr('type', 'checkbox').addClass('lightToggle pull-right')
                    light.on ? toggle.attr('checked', 'checked') : ''
                    var tmp = $('<a>').data('lifx', light).text(light.label).addClass('list-group-item').attr('id', light.id)
                    tmp.append(toggle)
                    $('#lightList').append(tmp)

//                  Tags in a light
                    $.each(light.tags, function (i, v) {
                        lifx.tags.push(v)
                    })
                })

                $('#tagList').empty
                $.each(lifx.tags, function (i, v) {
                    var tmp = $('<a>').text(v).addClass('list-group-item')
                    $('#tagList').append(tmp)
                })

                if (lifx.lights.length == 1) {
                    $('#lightList a').addClass('active')
                }

                $('.lightToggle').bootstrapSwitch({
                    animate: false,
                    size: 'small',
                    onSwitchChange: function (e, state) {
                        var selector = $(this).parents('a').first().attr('id')
                        console.log(selector)
                        state ? lifx.turnOn(selector) : lifx.turnOff(selector)
                    }
                });
            }
        )
    },
    turnOff: function (selector) {
        $.put(this.base_url + 'lights/' + selector + '/off.json', function (response) {

        })
    },
    turnOn: function (selector) {
        $.put(this.base_url + 'lights/' + selector + '/on.json', function (response) {

        })
    }
}


$(function () {
    lifx.getLights()


    $('#colorWheel').minicolors({
        inline: true
    })
})


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
    put: function(url, data, callback, type) {
        return _ajax_request(url, data, callback, type, 'PUT');
    },
    delete_: function(url, data, callback, type) {
        return _ajax_request(url, data, callback, type, 'DELETE');
    }
});