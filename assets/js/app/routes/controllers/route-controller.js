/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.routes')
    .controller('RouteController', [
      '$scope', '$rootScope', '$state', 'SettingsService','RoutesService', '$log', '_route','_service',
      function controller($scope, $rootScope, $state, SettingsService, RoutesService, $log, _route, _service) {

        console.log("RouteController loaded");

        $scope.route = _route.data
        if (_service) {
            $scope.service = _service.data
        }

        var upstreamName = $scope.service.host
        console.log("RouteController upstreamName: ", upstreamName);

        RoutesService.findUpstreamsByName(upstreamName)
            .then(function (res) {
                console.log("RouteController upstream Data: ", res);
                $scope.upstream = res.data
                console.log("RouteController upstream id: ", $scope.upstream.id);
            })

        // Fix empty object properties
        fixProperties()

        $state.current.data.pageName = "Route " + ($scope.route.name || $scope.route.id)
        $scope.activeSection = 0;
        $scope.sections = [
          {
            name: 'Route Details',
            icon: 'mdi mdi-information-outline',
            isVisible: true
          },
          {
            name: 'Service Details',
            icon: 'mdi mdi-directions-fork',
            isVisible: true
          },
          {
            name: 'Upstream Details',
            icon: 'mdi mdi-access-point',
            isVisible: true
          },
          {
            name: 'Target Details',
            icon: 'mdi mdi-target',
            isVisible: true
          },
          {
            name: 'Route Plugins',
            icon: 'mdi mdi-power-plug',
            isVisible: true
          },
          {
            name: 'Service Plugins',
            icon: 'mdi mdi-power-plug',
            isVisible: true
          },
          {
            name: 'Eligible consumers <span class="label label-danger">beta</span>',
            icon: 'mdi mdi-account-multiple-outline',
            isVisible: false
          },
        ]

        $scope.showSection = function (index) {
          $scope.activeSection = index
        }

        function fixProperties() {
          var problematicProperties = ['uris', 'hosts', 'methods']
          problematicProperties.forEach(function (property) {
            if ($scope.route[property] && isObject($scope.route[property]) && !Object.keys($scope.route[property]).length) {
              $scope.route[property] = ""
            }
          })
        }

        function isObject(obj) {
          return obj === Object(obj);
        }


        $scope.$on('user.node.updated', function (node) {
          $state.go('routes')
        })

      }
    ])
  ;
}());
