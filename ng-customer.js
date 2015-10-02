'use strict';

/**
 * customerApp Module
 *
 * Description
 */
var customerApp = angular.module('customerApp', ['ngRoute', 'angular.filter' ,'ngCookies']);

customerApp.controller('manageCustomer', ['$scope', '$http', function($scope, $http){
  $scope.block_title = "Customers";
}]);

/**
 * Route Provider.
 */
customerApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/',{
      templateUrl: 'companies.html',
      controller: 'viewCustomer'
    }).
    when('/events/:uid',{
      templateUrl: 'events.html',
      controller: 'viewEvents'
    }).
    when('/add-customer/:uid',{
      templateUrl: 'form-user.html',
      controller: 'addCustomer'
    }).
    otherwise({
      redirectTo: '/'
    });
}]);

/**
 * Controller view customer.
 */
customerApp.controller('viewCustomer', ['$scope', '$http', function($scope, $http){
  $http.get('http://localhost/angular/ticket-system/customers/json').success(function(data) {
    $scope.companies = data;
  });
  $scope.reverse = false;
  $scope.reverse_company = false;
  // Sort table customer.
  $scope.sortTable = function(type, reverse) {
    $scope.predicate = type;
    if ($scope.reverse == true) {
      $scope.reverse = false;
    } else {
      $scope.reverse = true;
    }
  }
  // Sort company.
  $scope.sortCompany = function() {
    if ($scope.reverse_company == true) {
      $scope.reverse_company = false;
    } else {
      $scope.reverse_company = true;
    }
  }
}]);

/**
 * Controller view Events.
 */
customerApp.controller('viewEvents', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http){
  var uid = $routeParams.uid;
  $http.get('http://localhost/angular/ticket-system/json-events/'+uid).success(function(data) {
    $scope.events = data;
  });
}]);

/**
 * Controller add Customer
 */
customerApp.controller('addCustomer', ['$scope', '$routeParams', '$http', 'drupalService', function($scope, $routeParams, $http, drupalService){
  $scope.cusid = $routeParams.uid;
  $scope.master= {};
  // Reset value of form.
  $scope.reset = function() {
    angular.copy($scope.master, $scope.user);
  }
  $scope.update = function(user) {
    alert('Ok');
  }
}]);

/**
 * Director validate email.
 */
customerApp.directive('uniqueemail',['drupalService', function(drupalService){
  // Runs during compile
  return {
    require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
    restrict: '', // E = Element, A = Attribute, C = Class, M = Comment
    link: function($scope, element, iAttrs, controller) {
      element.bind('blur', function (e) {
        if (controller && controller.$validators.email) {
          drupalService.check(element.val())
          .success(function(data, status, headers) {
            if (data.length == 0) {
              controller.$setValidity('uniqueEmail', true);
            } else {
              controller.$setValidity('uniqueEmail', false);
            }
          });
        }
      });
    }
  };
}]);

/**
 * Director validate email.
 */
customerApp.directive('uniquename',['drupalService', function(drupalService){
  // Runs during compile
  return {
    // name: '',
    // priority: 1,
    // terminal: true,
    // scope: {}, // {} = isolate, true = child, false/undefined = no change
    // controller: function($scope, $element, $attrs, $transclude) {},
    require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
    restrict: '', // E = Element, A = Attribute, C = Class, M = Comment
    link: function($scope, element, iAttrs, controller) {
      element.bind('blur', function (e) {
        if (element.val().length > 0) {
          drupalService.name(element.val())
          .success(function(data, status, headers) {
            if (data.length == 0) {
              controller.$setValidity('uniquename', true);
            } else {
              controller.$setValidity('uniquename', false);
            }
          });
        }
      });
    }
  };
}]);

customerApp.factory('drupalService', ['$http', '$cookies', function($http, $cookies) {
  var doRequest = function(email) {
    return $http({
      method: 'POST',
      data: {
        email: email,
      },
      url: 'http://localhost/angular/ticket-system/?q=drupalgap/ng_customer_services_resources/email_unique.json',
      headers: {
        'X-CSRF-Token': 'R0Z53lcjTmhhuk9ZD0Y8RKhxFHtECGdZtG0IewQLejc',
        'Content-Type': 'application/json'
      },
    });
  };

  var checkName = function(name) {
    return $http({
      method: 'POST',
      data: {
        username: name,
      },
      url: 'http://localhost/angular/ticket-system/?q=drupalgap/ng_customer_services_resources/username_unique.json',
      headers: {
        'X-CSRF-Token': 'R0Z53lcjTmhhuk9ZD0Y8RKhxFHtECGdZtG0IewQLejc',
        'Content-Type': 'application/json'
      },
    });
  };
  return {
    check: function(email) { return doRequest(email); },
    name: function(name) { return checkName(name); }
  };
}]);

customerApp.directive('confirmpassword', function(){
  return {
    scope: {
      rootPassword: "=confirmpassword"
    },
    require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
    restrict: '', // E = Element, A = Attribute, C = Class, M = Comment
    link: function(scope, element, iAttrs, controller) {
      controller.$validators.confirmpassword = function(modelValue) {
        return modelValue == scope.rootPassword;
      };
      scope.$watch("rootPassword", function() {
        controller.$validate();
      });
    }
  };
});
