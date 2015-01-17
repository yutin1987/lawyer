var lat = 25.0439111;
var lng = 121.5097688;
var city = 'taipei';
var polices = [];
var page = 'enter';
var alreadyLocation = false;

function setCity(city) {
  $.get('./data/' + city + '.json', function (res) {
    res.forEach(function(police, index){
      police.index = index;
    });
    polices = res.slice(0);

    res.sort( function(a, b) {
      var va = Math.abs(a.location.lat - lat) + Math.abs(a.location.lng - lng);
      var vb = Math.abs(b.location.lat - lat) + Math.abs(b.location.lng - lng);
      return va - vb;
      }
    );
    
    optgroup = [];

    option_dom = [];
    var max = (res.length > 5 ? 5 : res.length);
    for (var i = 0; i < max; i++) {
      police = res[i];
      if (0===i) {
        option_dom.push('<option selected="selected" value="'+police.index+'">'+police.name+'</option>');
        setMap(police.location.lat, police.location.lng);
      } else {
        option_dom.push('<option value="'+police.index+'">'+police.name+'</option>');
      }
    }
    optgroup.push('<optgroup label="附近">' + option_dom.join('') + '</optgroup>');

    option_dom = [];
    polices.forEach(function(police){
      option_dom.push('<option value="'+police.index+'">'+police.name+'</option>');
    });
    optgroup.push('<optgroup label="警察局所">' + option_dom.join('') + '</optgroup>');

    $('#police').html(optgroup.join('')).selectmenu('refresh');
  });
}

function setMap(lat, lng) {
  map = 'http://maps.googleapis.com/maps/api/staticmap?center='+lat+','+lng+'&language=zh-TW&zoom=16&size=640x640&maptype=roadmap&sensor=false';
  $('#map').attr('src', map);
}

function resertLocation() {
  city_select = $('#city');
  $('option[value='+city+']', city_select).attr('selected', true);
  city_select.selectmenu('refresh');

  setCity(city);
}

/**
 * Page Change
 */
$(document).on('pagechange', function(e, page) {
  page = page.toPage[0].id;

  switch(page) {
    case 'enter':
      break;
    case 'loaction':
      if (false === alreadyLocation) {
        alreadyLocation = true;
        resertLocation();
      }

      $('#city').on('change', function(e){
        setCity($(e.target).val());
      });

      $('#police').on('change', function(e){
        police = polices[$(e.target).val()];
        setMap(police.location.lat, police.location.lng);
      });
      break;

    case 'form':
      break;
    case 'pay':
      break;
    case 'asign':
      break;
    case 'contact':
      break;
  }
});

$(function(){
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        lat = position.coords.latitude;
        lng = position.coords.longitude;

        $.get('https://maps.googleapis.com/maps/api/geocode/json?language=en&latlng=' + lat + ',' + lng, function (res) {
          var result = res.results;
          var address = / *([\w]+) *city/gi.exec(result[0]['formatted_address']);
          if (address) {
            city = address[1].toLowerCase();
            if('loaction' === page) resertLocation();
          } else {
            city = 'taipei';
            if('loaction' === page) resertLocation();
          }
        });
      }, function() {
        city = 'taipei';
        if('loaction' === page) resertLocation();
      }
    );
  } else {
    alert('No geolocation!');
  }
});