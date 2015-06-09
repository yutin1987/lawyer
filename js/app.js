var lat = 25.0439111;
var lng = 121.5097688;
var city = 'taipei';
var polices = [];
var page = 'enter';
var alreadyLocation = false;
var price = [5000, 5000, 5000];
var timer = null;
var waiter = null;
var defWatting = 30;
var watting = 30;

Parse.initialize(
  'zJ4qLLQRZmw3SQASnWRov4Q1IUijIRyCT5PwKfnC',
  'uJxPk1ZApuv1wHnInYnyQgfRjK65i34xknu3f1oK'
);

var storage = $.localStorage;

var Lawyer = Parse.Object.extend("User");
var lawyer = new Parse.Query(Lawyer);

var Order = Parse.Object.extend("Order");
var order = new Parse.Query(Order);
var orderId = storage.get('orderId') || null;

var name = storage.get('name') || '';
var phone = storage.get('phone') || '';

var police = {};

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

function getOrder(orderId, callback) {
  order.get(orderId, {
    success: function(order) {

      var reply = {
        'wait': order.get('wait'),
        'lawyerId': order.get('lawyer'),
        'closedAt': order.get('closedAt') ? new Date(order.get('closedAt')) : null,
        'moneyOfClose': order.get('moneyOfClose'),
        'cancelAt': order.get('cancelAt') ? new Date(order.get('cancelAt')) : null,
        'causeOfCancel': order.get('causeOfCancel'),
        'createdAt': new Date(order.createdAt)
      };

      if (reply.lawyerId && reply.lawyerId != '9999999999') {
        lawyer.get(reply.lawyerId, {
          success: function(lawyer) {
            reply.lawyerName = lawyer.get('name');
            reply.lawyerTel = lawyer.get('username');
            reply.lawyerPhoto = lawyer.get('photo').url();
            callback(null, reply);
          },
          error: function(lawyer, error) {
            callback(error, reply);
          }
        });
      } else {
        callback(null, reply);
      }
    },
    error: function(order, error) {
      alert('單號' + orderId + '錯誤');
      callback(error);
    }
  });
}

/**
 * Page Change
 */
$(document).on('pagechange', function(e, page) {
  page = page.toPage[0].id;

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
      $('#input-name').val(name);
      $('#input-phone').val(phone);

      $('#go-to-pay').on('click', function(e) {
        var checked = true;
        if (!$('#input-name').val()) {
          alert('警告！\n姓名為必要項目');
          checked = false;
        } else {
          name = $('#input-name').val();
          storage.set('name', name);
        }

        if (!$('#input-phone').val()) {
          alert('警告！\n手機為必要項目');
          checked = false;
        } else if (!/^0[1-9][0-9]{8}/.test($('#input-phone').val())) {
          alert('警告！\n手機必須是10個數字');
          checked = false;
        } else {
          phone = $('#input-phone').val();
          storage.set('phone', phone);
        }

        if (checked) {
          location.href = '#pay';
        }
      });
      break;

    case 'pay':
      if (!name || !phone) {
        location.href = '#form';
      }

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
      if (!name || !phone) {
        location.href = '#form';
      }

      var type;
      if ($('#input-type-1').prop('checked'))
        type = 'dope';
      else if ($('#input-type-2').prop('checked'))
        type = 'traffic';
      else
        type = 'other';

      if (!orderId) {
        new Order()
        .save({
          'name': name,
          'phone': phone,
          'location': police,
          'type': type
        }, {
          success: function(order) {
            orderId = order.id;
            storage.set('orderId', orderId);
            watting = 30;
          },
          error: function(order, error) {
            alert('建單失敗！');
            location.href = '#form';
          }
        });
      }

      $('#timer').text(watting);

      var waiter;
      (waiter = function() {
        timer = setTimeout(function(){
          watting -= 1;
          $('#timer').text(watting);

          if (watting % 5 === 0) {
            getOrder(orderId, function(err, reply) {
              if (!err && reply.lawyerId) {
                location.href = '#contact'; // '?id=' + orderId + 
              }
            });
          }

          if (watting <= 0) {
            location.href = '#contact'; // '?id=' + orderId + 
          } else {
            waiter();
          }
        }, 1000);
      })();

      $('#go-to-cancel').on('click', function() {
        orderId = null;
        storage.remove('orderId');
        location.href = '#loaction';
      });
      break;

    case 'contact':
      // var regex = new RegExp("[\\?&]id=([^&#]*)");
      // var results = regex.exec(location.search);
      // if (results !== null) {
      //   orderId = decodeURIComponent(results[1].replace('/',''));
      // }
      
      getOrder(orderId, function(err, reply) {
        if (!err) {
          if (reply.lawyerId && reply.lawyerId != '9999999999') {
            var tel = /^(0[0-9]{3})([0-9]{3})([0-9]{3})/gi.exec(reply.lawyerTel);
            $('#lawyer-name').text(reply.lawyerName);
            $('#lawyer-tel').attr('href', 'tel:' + reply.lawyerTel);
            $('#lawyer-tel label').text(tel[1] + '-' + tel[2] + '-' + tel[3]);
            $('#lawyer-photo').attr('src', reply.lawyerPhoto);
          } else {
            $('#lawyer-name').text('沒有律師接單');
            $('#lawyer-tel').attr('href', 'tel:0958328001');
            $('#lawyer-tel label').text('0958-328-001');
            $('#lawyer-photo').attr('src', './img/photo.jpg');
          }
        } else {
          alert('查詢失敗');
        }
      });

      $('#go-to-new').on('click', function() {
        orderId = null;
        storage.remove('orderId');
        location.href = '#loaction';
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

  if (orderId) {
    getOrder(orderId, function(err, reply) {
      if (!err) {
        var time = Math.floor((new Date().getTime() - reply.createdAt.getTime()) / 1000);
        if (time < defWatting) {
          watting = defWatting - time;
          location.href = '#asign';
        } else {
          location.href = '#contact';
        }
      } else {
        alert('查詢失敗');
      }
    });
  }
});