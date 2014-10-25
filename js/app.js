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

        $scope.select = {
          city: 'taipei',
          police: {},
          show: false
        };

        $scope.city = [
          {id: 'keelung', name: '基隆'},
          {id: 'taipei', name: '台北'},
          {id: 'taoyuan', name: '桃園'},
          {id: 'hsinchu', name: '新竹'},
          {id: 'miaoli', name: '苗栗'},
          {id: 'taichung', name: '台中'},
          {id: 'changhua', name: '彰化'},
          {id: 'yunlin', name: '雲林'},
          {id: 'chiayi', name: '嘉義'},
          {id: 'tainan', name: '台南'},
          {id: 'kaohsiung', name: '高雄'},
          {id: 'pingtung', name: '屏東'},
          {id: 'yilan', name: '宜蘭'},
          {id: 'hualien', name: '花蓮'},
          {id: 'taitung', name: '台東'},
          {id: 'nantou', name: '南投'},
          {id: 'penghu', name: '澎湖'},
        ];

        $scope.police = [
          {name: '尚未定位', unit: '警察局'}
        ];

        $scope.lat = 0;
        $scope.lng = 0;

        var getPolice = function (police) {
          var lat = $scope.lat;
          var lng = $scope.lng;
          $.get('./data/' + $scope.select.city + '.json', function (res) {
            res.sort( function(a, b) {
              var va = Math.abs(a.location.lat - lat) + Math.abs(a.location.lng - lng);
              var vb = Math.abs(b.location.lat - lat) + Math.abs(b.location.lng - lng);
              return va - vb;
              }
            );

            $scope.select.police = null;

            if (police) {
              for (var i = res.length - 1; i >= 0; i--) {
                if (police.name === res[i].name) {
                  $scope.select.police = res[i];
                }
              };
            }

            if (!$scope.select.police) {
              $scope.select.police = res[0];
            }

            $scope.map = 'http://maps.googleapis.com/maps/api/staticmap?center='+$scope.select.police.location.lat+','+$scope.select.police.location.lng+'&language=zh-TW&zoom=16&size=640x640&maptype=roadmap&sensor=false';
            for (var i = 0; i < 5; i++) {
              res[i].unit = '附近局所';
            }
            for (var i = 5; i < res.length; i++) {
              res[i].unit = '警察局';
            }
            $scope.police = res;
            $scope.select.show = false;
            $scope.$apply();
          });
        };

        $scope.changeCity = function () {
          getPolice();
        };

        $scope.changePolice = function () {
          getPolice($scope.select.police);
        };

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
                  $scope.select.city = city[1].toLowerCase();
                  getPolice();
                }
              });
            }, function() {
              alert('Failed!');
            }
          );
        } else {
          alert('No geolocation!');
        }

        $scope.other = function () {
          $('#city').click();
        };
      }
    })
    .state('form', {
      url: "/form",
      templateUrl: "view/form.html",
      controller: function($scope) {
      }
    })
    .state('pay', {
      url: "/pay",
      templateUrl: "view/pay.html",
      controller: function($scope) {
      }
    })
    .state('asign', {
      url: "/asign",
      templateUrl: "view/asign.html",
      controller: function($scope, $timeout, $state) {
        $scope.sec = 120;
        var label;
        (label = function () {
          $scope.sec -= 1;
          if ($scope.sec > 0) {
            $timeout(label, 1000);
          } else {
            $state.go('contact');
          }
        })();
      }
    })
    .state('contact', {
      url: "/contact",
      templateUrl: "view/contact.html",
      controller: function($scope) {
      }
    });
});