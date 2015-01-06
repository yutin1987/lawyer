$(function(){
  var lat = 25.0439111;
  var lng = 121.5097688;
  var polices = [];

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        lat = position.coords.latitude;
        lng = position.coords.longitude;

        console.log(lat, lng);

        $.get('https://maps.googleapis.com/maps/api/geocode/json?language=en&latlng=' + lat + ',' + lng, function (res) {
          var result = res.results;
          var city = / *([\w]+) *city/gi.exec(result[0]['formatted_address']);
          if (city) {
            city = city[1].toLowerCase();
            console.log(city);
            city_select = $('#city');
            $('option[value='+city+']', city_select).attr('selected', true);
            city_select.selectmenu('refresh');
            setCity(city);
          } else {
            setCity('taipei');
          }
        });
      }, function() {
        setCity('taipei');
      }
    );
  } else {
    alert('No geolocation!');
  }

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

  $('#city').on('change', function(e){
    setCity($(e.target).val());
  });

  $('#police').on('change', function(e){
    police = polices[$(e.target).val()];
    setMap(police.location.lat, police.location.lng);
  });

  function setMap(lat, lng) {
    map = 'http://maps.googleapis.com/maps/api/staticmap?center='+lat+','+lng+'&language=zh-TW&zoom=16&size=640x640&maptype=roadmap&sensor=false';
    $('#map').attr('src', map);
  }
});