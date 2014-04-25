var lifx = {
    base_url: window.localStorage['base_url'] ? window.localStorage['base_url'] : 'http://localhost:56780/',
    tags: {},
    lights: {},
    selected: [],
    getLights: function () {
        $.get(this.base_url + 'lights.json', function (response) {
                $('#lightList').empty()
                $.each(response, function (i, light) {
                    var toggle = $('<input>').attr('type', 'checkbox').addClass('lightToggle pull-right')
                    light.on ? toggle.attr('checked', 'checked') : ''
                    var tmp = $('<a>').addClass('list-group-item light').attr('id', light.id)
                    tmp.append('<span>' + light.label + '</span>')
                    tmp.append('<a href="#" class="editLabel"><span class="glyphicon glyphicon-pencil"></span></a>')
                    tmp.append(toggle)
                    $('#lightList').append(tmp)
                    $.each(light.tags, function (i, tag) {
                        lifx.tags[tag] = {}
                    })
                    lifx.lights[light.id] = light
                })

                $.each(lifx.lights, function (id, light) {
                    $.each(light.tags, function (u, tag) {
                        lifx.tags[tag][id] = light
                    })
                })

                $('#tagList').empty
                $.each(lifx.tags, function (tag, lights) {
                    var allOn = true
                    $.each(lights, function (id, light) {
                        light.on ? '' : allOn = false
                    })
                    var toggle = $('<input>').attr('type', 'checkbox').addClass('lightToggle pull-right')
                    allOn ? toggle.attr('checked', 'checked') : ''
                    var tmp = $('<a>').addClass('list-group-item tag').attr('id', 'tag:' + tag)
                    tmp.append('<span>' + tag + '</span>')
                    tmp.append(toggle)
                    $('#tagList').append(tmp)
                })


                if (lifx.lights.length == 1) {
                    $('#lightList a').addClass('active')
                    lifx.selected.push(lifx.lights[0].id)

                    var hsb = lifx.lights[0].color
                    var rgb = hsbToRgb(hsb.hue, hsb.saturation, hsb.brightness)
                    var hex = rgbToHex(rgb.red, rgb.green, rgb.blue)
                    $('#colorWheel').minicolors('value', hex);
                    $('#colorTemp').val(lifx.lights[0].color.kelvin)
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
    },
    setColor: function (selector, hsb, kelvin, duration) {
        $.put(this.base_url + 'lights/' + selector + '/color.json', {
            hue: hsb.hue * 360,
            saturation: hsb.sat,
            brightness: hsb.bri,
            kelvin: kelvin ? kelvin : 10000,
            duration: duration ? duration : '0.3s'
        })
    }, setLabel: function (id, label) {
        $.put(this.base_url + 'lights/' + id + '/label.json', {
            label: label
        }, function (response) {
            $('#' + response.id + '> span').text(response.label)
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
        var color = $('#colorWhffeel').minicolors('rgbObject')
        var hsb = rgbToHsb(color.r, color.g, color.b)
        return hsb
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
    $('#saveSettings').click(function(e){
        e.preventDefault()
        var newURL = $('#host').val()
        $.get(newURL+'/lights.json').success(function(result){
            window.localStorage['base_url'] = newURL
            window.location.reload()
        }).error(function(){
            alert('No response..')
        })

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
    })

//    Make bootstrap-switch buttons react when clicking on "white" part of switch also
    $(document).on('click', '.bootstrap-switch-label', function (e) {
        e.preventDefault()
        var parent = $(this).parent().parent()
        if (parent.hasClass('bootstrap-switch-on')) {
            $(this).prev().click()
        } else {
            $(this).next().click()
        }
    })
})
