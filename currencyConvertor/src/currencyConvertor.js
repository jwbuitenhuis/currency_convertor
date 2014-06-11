/*global angular, console*/

/*

Directive that renders an interactive convertor widget. Exchange
rates are retrieved from a backend service and cached for 15 mins.

*/

(function () {

    "use strict";

    angular.module('currencyConvertor', [])
        .directive('currencyConvertor', ['$sce', '$http', function ($sce, $http) {

            return {
                restrict: 'E',
                scope: false,
                templateUrl: 'partials/currencyconvertor.html',
                link: function (scope) {
                    var rates = {};

                    scope.amount = 1000;

                    function getCachedRate(from, to) {
                        var now = new Date().getTime(),
                            cacheTime = 15 * 60 * 1000, // 15 mins in milliseconds
                            rate;

                        // somebody might invent a currency that happens to be a
                        // javascript reserved object property? better safe than sorry.
                        if (rates.hasOwnProperty(from)) {
                            rate = rates[from][to];
                        }

                        // if rate found in cache and still fresh
                        if (rate && now - rate.timestamp < cacheTime) {
                            return rate.rate;
                        }
                    }

                    scope.filterTo = function (value) {
                        return value.name !== scope.from.name;
                    };

                    scope.getExchangeRate = function (from, to) {
                        var url = '/currencyProxy.php?from=' + from + '&to=' + to;

                        return $http.get(url).then(function (response) {

                            if (!rates.hasOwnProperty(from)) {
                                rates[from] = {};
                            }

                            rates[from][to] = {
                                rate: response.data.rate,
                                timestamp: new Date().getTime()
                            };
                        });
                    };

                    scope.updateConverted = function () {
                        var from = scope.from.name,
                            to = scope.to.name,
                            cachedRate = getCachedRate(from, to);

                        if (from === to) {
                            scope.converted = scope.amount;
                        } else if (cachedRate) {
                            scope.converted = scope.amount * cachedRate;
                        } else {
                            scope.converted = '';
                            scope.loading = true;

                            scope.getExchangeRate(from, to).then(function () {
                                scope.converted = scope.amount * rates[from][to].rate;
                                scope.loading = false;
                            });
                        }
                    };

                    scope.currencies = [
                        { "name": "GBP", "entity": $sce.trustAsHtml("&pound;") },
                        { "name": "EUR", "entity": $sce.trustAsHtml("&euro;") },
                        { "name": "USD", "entity": $sce.trustAsHtml("&#36;") }
                    ];

                    // initial value, optimize for target audience
                    scope.from = scope.currencies[0];
                    scope.to = scope.currencies[1];
                    scope.converted = scope.amount;

                    scope.$watch('amount', scope.updateConverted);
                    scope.$watch('to', scope.updateConverted);
                    scope.$watch('from', function (newValue) {

                        // if user picks same currencies on both end, pick another.
                        if (scope.to.name === newValue.name) {

                            // ES6 => Array.find!
                            scope.to = scope.currencies.filter(function (currency) {
                                return currency.name !== newValue.name;
                            })[0];
                        }
                        scope.updateConverted();
                    });

                }
            };
        }]);

}());
