var lifx = {
    base_url: window.localStorage['base_url'] ? window.localStorage['base_url'] : 'http://localhost:56780/',
    tags: [],
    lights: [],
    getLights: function () {
        $.get(this.base_url + 'lights.json', function (response) {
//            Go through all the lights
                lifx.lights = response
                $.each(response, function (i, light) {
                    var tmp = $('<li>').data('lifx', light).text(light.label)
                    $('#lightList').append(tmp)

//                  Tags in a light
                    $.each(light.tags, function (i, v) {
                        lifx.tags.push(v)
                    })
                })

                $.each(lifx.tags, function (i, v) {
                    var tmp = $('<li>').text(v)
                    $('#tagList').append(tmp)
                })
            }
        )
    }
}


$(function () {
    lifx.getLights()


})