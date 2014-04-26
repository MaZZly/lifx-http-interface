var lifx = {
    base_url: window.localStorage['base_url'] ? window.localStorage['base_url'] : 'http://localhost:56780',
    tags: {},
    lights: {},
    selected: [],
    getLights: function () {
        $.get(this.base_url + '/lights.json', function (response) {
                $('#lights').empty()
                $.each(response, function (i, light) {
                    var toggle = $('<input>').attr('type', 'checkbox').addClass('lightToggle pull-right')
                    light.on ? toggle.attr('checked', 'checked') : ''
                    var tmp = $('<a>').addClass('list-group-item light').attr('id', light.id)
                    tmp.append('<span>' + light.label + '</span>')
                    tmp.append('<a href="#" class="editLabel"><span class="glyphicon glyphicon-pencil"></span></a>')
                    tmp.append(toggle)
                    $('#lights').append(tmp)
                    $.each(light.tags, function (i, tag) {
                        lifx.tags[tag] = []
                    })
                    lifx.lights[light.id] = light
                })

                $.each(lifx.lights, function (id, light) {
                    $.each(light.tags, function (u, tag) {
                        lifx.tags[tag].push(id)
                    })
                })

                $('#tags').empty()
                $.each(lifx.tags, function (tag, lights) {
                    var allOn = true
                    $.each(lights, function (i, id) {
                        lifx.lights[id].on ? '' : allOn = false
                    })
                    var toggle = $('<input>').attr('type', 'checkbox').addClass('lightToggle pull-right')
                    allOn ? toggle.attr('checked', 'checked') : ''
                    var tmp = $('<a>').addClass('list-group-item tag').attr('id', 'tag:' + tag)
                    tmp.append('<span>' + tag + '</span>')
                    tmp.append(toggle)
                    $('#tags').append(tmp)
                })

                if (Object.keys(lifx.lights).length == 1) {
                    $('#lights a').addClass('active')
                    var id = $('.list-group-item.active').attr('id')
                    lifx.selected.push(id)
                    colorwheel.setColorandTemp(lifx.lights[id].color)
                }

                $('.lightToggle').bootstrapSwitch({
                    size: 'small',
                    onSwitchChange: function (e, state) {
                        e.preventDefault()
                        var selector = $(this).parents('a').first().attr('id')
                        state ? lifx.setLight(selector, true) : lifx.setLight(selector, false)
                    }
                });

            }
        )
    },
    setLight: function (selector, state) {
        var state = state ? 'on' : 'off'
        $.put(this.base_url + '/lights/' + selector + '/' + state + '.json', function (response) {
            response = !(response instanceof Array) ? [response] : response
            $.each(response, function (i, light) {
                lifx.lights[light.id] = light
                $('#' + light.id + ' .lightToggle').bootstrapSwitch('state', light.on, true)
            })
            lifx.setTagStates()
        })
    },
    setTagStates: function () {
        $.each(lifx.tags, function (tag, lights) {
            var allOn = true
            $.each(lights, function (i, id) {
                lifx.lights[id].on ? '' : allOn = false
            })
            $('#tag\\:' + tag + ' .lightToggle').bootstrapSwitch('state', allOn, true)
        })
    },
    setColor: function (selector, hsb, kelvin, duration) {
        $.put(this.base_url + '/lights/' + selector + '/color.json', {
            hue: hsb.hue * 360,
            saturation: hsb.sat,
            brightness: hsb.bri,
            kelvin: kelvin ? kelvin : 10000,
            duration: duration ? duration : '0.3s'
        }, function (response) {
//            Special case.. LIFX doesnt return new color instantly due to duration..
//              If successful response set color ourselves
            response = !(response instanceof Array) ? [response] : response
            $.each(response, function (i, light) {
                lifx.lights[light.id] = light
                lifx.lights[light.id].color = {
                    hue: hsb.hue * 360,
                    saturation: hsb.sat,
                    brightness: hsb.bri,
                    kelvin: kelvin
                }
            })
        })
    }, setLabel: function (id, label) {
        $.put(this.base_url + '/lights/' + id + '/label.json', {
            label: label
        }, function (light) {
            $('#' + light.id + '> span').text(light.label)
            lifx.lights[light.id] = light
        })
    }
}

var colorwheel = {
    init: function () {
        $('#colorWheel').minicolors({
            inline: true
        })
    },
    getColor: function () {
        var color = $('#colorWheel').minicolors('rgbObject')
        var hsb = rgbToHsb(color.r, color.g, color.b)
        return hsb
    },
    setColorandTemp: function (color) {
        var rgb = hsbToRgb(color.hue / 360, color.saturation, color.brightness)
        var hex = rgbToHex(rgb.red, rgb.green, rgb.blue)
        $('#colorWheel').minicolors('value', hex);
        $('#colorTemp').val(color.kelvin)
    },
    getTemp: function () {
        return $('#colorTemp').val()
    }
}

$(function () {
    lifx.getLights()
    colorwheel.init()


    $('#setColor').click(function (e) {
        e.preventDefault()
        var hsb = colorwheel.getColor()
        var kelvin = colorwheel.getTemp()
        $.each(lifx.selected, function (i, selector) {
            lifx.setColor(selector, hsb, kelvin)
        })
    })

    $('#host').val(lifx.base_url)

    $('#saveSettings').click(function () {
        var newURL = $('#host').val()

        $.get(newURL + '/lights.json').success(function (result) {
            $('#settings').modal('hide')
            window.localStorage['base_url'] = newURL
            lifx.base_url = newURL
            lifx.getLights()
        }).error(function () {
            alert('No response..')
        })
    })
    $('#resetSettings').click(function () {
        $('#host').val('http://localhost:56780')
    })

    $(document).on('click', '.editLabel', function (e) {
        e.preventDefault()
        var label = $(this).prev().text()
        var newlabel = prompt('New label', label)
        if (newlabel) {
            var id = $(this).parent().attr('id')
            lifx.setLabel(id, newlabel)
        }
    })

    $(document).on('click', '.list-group-item', function (e) {
        var item = $(this)
        if (e.ctrlKey) {
            if (item.hasClass('active')) {
                item.removeClass('active')
                lifx.selected.pop(item.attr('id'))
            } else {
                item.addClass('active')
                lifx.selected.push(item.attr('id'))
            }
        } else {
            $('.list-group-item').removeClass('active')
            item.addClass('active')
            lifx.selected = [item.attr('id')]
        }
        if ($('.list-group-item.active').length != 0) {
            $('#colorBox').slideDown()
        } else {
            $('#colorBox').slideUp()
        }
        if ($('.list-group-item.active').length == 1) {
            var id = $('#lights .list-group-item.active').attr('id')
            if (id) {
                colorwheel.setColorandTemp(lifx.lights[id].color)
            }
        }
    })

//    Make bootstrap-switch buttons react when clicking on "white" part of switch also
    $(document).on('click', '.bootstrap-switch-label', function (e) {
        e.preventDefault()
        $(this).next().next().bootstrapSwitch('toggleState')
    })
})
