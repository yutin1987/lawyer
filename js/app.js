var lat = 25.0439111;
var lng = 121.5097688;
var city = 'taipei';
var polices = [];
var page = 'enter';
var alreadyLocation = false;
var price = [5000, 5000, 5000];
var timer = null;
var waiter = null;
var watting = 30;
var police = {};

Parse.initialize(
  'zJ4qLLQRZmw3SQASnWRov4Q1IUijIRyCT5PwKfnC',
  'uJxPk1ZApuv1wHnInYnyQgfRjK65i34xknu3f1oK'
);


var Lawyer = Parse.Object.extend("User");
var lawyer = new Parse.Query(Lawyer);

var Order = Parse.Object.extend("Order");
var order = new Parse.Query(Order);
var orderId = null;

function setCity(city) {
  $.get('./data/' + city + '.json', function (res) {
    res.forEach(function(item, index){
      item.index = index;
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
      item = res[i];
      if (0===i) {
        police = item;
        option_dom.push('<option selected="selected" value="'+item.index+'">'+police.name+'</option>');
        $('#target-police').text(item.name);
        setMap(item.location.lat, item.location.lng);
      } else {
        option_dom.push('<option value="'+item.index+'">'+item.name+'</option>');
      }
    }
    optgroup.push('<optgroup label="附近">' + option_dom.join('') + '</optgroup>');

    option_dom = [];
    polices.forEach(function(item){
      option_dom.push('<option value="'+item.index+'">'+item.name+'</option>');
    });
    optgroup.push('<optgroup label="警察局所">' + option_dom.join('') + '</optgroup>');

    $('#input-police').html(optgroup.join('')).selectmenu('refresh');
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

function getTimeRange() {
  var date = new Date();
  var hour = date.getHours();
  var min = date.getMinutes();

  var now = hour * 60 + min;

  if (now >= 21 * 60 || now < 5 * 60) {
    return 0;
  } else if (now >= 5 * 60 & now < 13 * 60) {
    return 1;
  } else if (now >= 13 * 60 & now < 21 * 60) {
    return 2;
  }
}

/**
 * Page Change
 */
$(document).on('pagechange', function(e, page) {
  page = page.toPage[0].id;

  watting = 30;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }

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

      $('#input-police').on('change', function(e){
        police = polices[$(e.target).val()];
        setMap(police.location.lat, police.location.lng);
        $('#target-police').text(police.name);
      });
      break;

    case 'form':
      console.log(police);
      break;

    case 'pay':
      var time = getTimeRange();
      $('.priceRange').each(function(i){
        if (i === time) {
          $(this).addClass('price--star');
        } else {
          $(this).removeClass('price--star');
        }
      });
      break;

    case 'asign':
      var type;
      if ($('#input-type-1').prop('checked'))
        type = 'dope';
      else if ($('#input-type-2').prop('checked'))
        type = 'traffic';
      else if ($('#input-type-2').prop('checked'))
        type = 'other';

      new Order()
      .save({
        'name': $('#input-name').val(),
        'phone': $('#input-phone').val(),
        'location': police,
        'type': type
      }, {
        success: function(order) {
          orderId = order.id;
        },
        error: function(order, error) {
        }
      });

      var waiter;
      (waiter = function() {
        timer = setTimeout(function(){
          watting -= 1;
          $('#timer').text(watting);

          if (watting % 5 === 0) {
            order.get(orderId, {
              success: function(order) {
                if (order.get('lawyer')) {
                  location.href = '?id=' + orderId + '#contact';
                }
              },
              error: function(order, error) {
              }
            });
          }

          if (watting <= 0) {
            location.href = '?id=' + orderId + '#contact';
          } else {
            waiter();
          }
        }, 1000);
      })();
      break;

    case 'contact':
      var regex = new RegExp("[\\?&]id=([^&#]*)");
      var results = regex.exec(location.search);
      if (results !== null) {
        orderId = decodeURIComponent(results[1].replace('/',''));
      }
      
      order.get(orderId, {
        success: function(order) {
          var lawyerId = order.get('lawyer');
          if (lawyerId) {
            lawyer.get(lawyerId, {
              success: function(lawyer) {
                $('#lawyer-name').text(lawyer.get('name'));
                $('#lawyer-tel').text(lawyer.get('username'));
              },
              error: function(lawyer, error) {
              }
            });
          }
        },
        error: function(order, error) {
          console.log(error);
        }
      });

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