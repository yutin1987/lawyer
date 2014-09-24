// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise("/home");

  $stateProvider
    .state('home', {
      url: "/home",
      templateUrl: "view/home.html"
    })
    .state('location', {
      url: "/location",
      templateUrl: "view/location.html",
      controller: function($scope) {

        $scope.citys = [
          {name: '台北', value: 'taipei'},
          {name: '彰化', value: 'changhua'},
          {name: '新竹', value: 'chupei'},
          {name: '雲林', value: 'douliu'},
          {name: '花蓮', value: 'hualien'},
          {name: '高雄', value: 'kaohsiung'},
          {name: '基隆', value: 'keelung'},
          {name: '澎湖', value: 'magong'},
          {name: '苗栗', value: 'miaoli'},
          {name: '南投', value: 'nantou'},
          {name: '屏東', value: 'pingtung'},
          {name: '嘉義', value: 'taibao'},
          {name: '台中', value: 'taichung'},
          {name: '台南', value: 'tainan'},
          {name: '台東', value: 'taitung'},
          {name: '桃園', value: 'taoyuan'},
          {name: '宜蘭', value: 'yilan'},
        ];

        $scope.polices = [
          {name: '尚未定位', unit: '附近局所'}
        ];

        var getPolice = function (cb) {
          var lat = $scope.lat;
          var lng = $scope.lng;
          $.get('./data/' + $scope.city + '.json', function (res) {
            res.sort( function(a, b) {
              var va = Math.abs(a.location.lat - lat) + Math.abs(a.location.lng - lng);
              var vb = Math.abs(b.location.lat - lat) + Math.abs(b.location.lng - lng);
              return va - vb;
              }
            );
            if (cb) {
              cb(null, res);
            }
          });
        }

        if(navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            function(position) {
              var x = $scope.lat = position.coords.latitude;
              var y = $scope.lng = position.coords.longitude;
              $scope.map = 'http://maps.googleapis.com/maps/api/staticmap?center='+x+','+y+'&language=zh-TW&zoom=16&size=640x640&maptype=roadmap&sensor=false';
              $.get('https://maps.googleapis.com/maps/api/geocode/json?language=en&latlng=' + x + ',' + y, function (res) {
                var result = res.results;
                var city = / *([\w]+) *city/gi.exec(result[0]['formatted_address']);
                if (city) {
                  $scope.city = city[1].toLowerCase();
                  getPolice( function(err, res) {
                    $scope.police = res[0];
                    $scope.map = 'http://maps.googleapis.com/maps/api/staticmap?center='+res[0].location.lat+','+res[0].location.lng+'&language=zh-TW&zoom=16&size=640x640&maptype=roadmap&sensor=false';
                    for (var i = 0; i < 5; i++) {
                      res[i].unit = '附近局所';
                    }
                    for (var i = 5; i < res.length; i++) {
                      res[i].unit = '警察局';
                    }
                    $scope.polices = res;
                    $scope.$apply();
                  });
                }
              });
            }, function() {

            }
          );
        } else {

        }

        $scope.other = function () {
          $('#city').click();
        }

      }
    });
});