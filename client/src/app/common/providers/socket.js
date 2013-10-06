'use strict';

angular.module('socket-io', []).provider('socket', function () {

    // when forwarding events, prefix the event name
    var prefix = 'socket:'
      , ioSocket;

    // expose to provider
    this.$get = function ($rootScope, $timeout) {

      var socket = ioSocket || io.connect();

      var asyncAngularify = function (callback) {
        return function () {
          var args = arguments;
          $timeout(function () {
            callback.apply(socket, args);
          }, 0);
        };
      };

      var addListener = function (eventName, callback) {
        socket.on(eventName, asyncAngularify(callback));
      };

      var wrappedSocket = {
        on: addListener,
        addListener: addListener,

        emit: function (eventName, data, callback) {
          if (callback) {
            socket.emit(eventName, data, asyncAngularify(callback));
          } else {
            socket.emit(eventName, data);
          }
        },

        request: function (url, data, cb, method) {

          // Remove trailing slashes and spaces
          url = url.replace(/^(.+)\/*\s*$/, '$1');
          method = method || 'get';


          if ( typeof url !== 'string' ) {
            throw 'Invalid or missing URL!';
          }

          // Allow data arg to be optional
          if ( typeof data === 'function' ) {
            cb = data;
            data = {};
          }

          // Build to request
          var json = io.JSON.stringify({
            url: url,
            data: data
          });


          // Send the message over the socket
          wrappedSocket.emit(method, json, function afterEmitted (result) {

            var parsedResult = result;

            if (result && typeof result === 'string') {
              try {
                parsedResult = io.JSON.parse(result);
              } catch (e) {
                throw "Server response could not be parsed!\n" + result;
              }
            }

            // TODO: Handle errors more effectively
            if (parsedResult === 404) throw new Error("404: Not found");
            if (parsedResult === 403) throw new Error("403: Forbidden");
            if (parsedResult === 500) throw new Error("500: Server error");

            cb && cb(parsedResult);

          });
        },

        get: function (url, data, cb) {
          return this.request(url, data, cb, 'get');
        },

        post: function (url, data, cb) {
          return this.request(url, data, cb, 'post');
        },

        put: function (url, data, cb) {
          return this.request(url, data, cb, 'put');
        },

        delete: function (url, data, cb) {
          return this.request(url, data, cb, 'delete');
        },

        removeListener: function () {
          var args = arguments;
          return socket.removeListener.apply(socket, args);
        },

        // when socket.on('someEvent', fn (data) { ... }),
        // call scope.$broadcast('someEvent', data)
        forward: function (events, scope) {
          if (events instanceof Array === false) {
            events = [events];
          }
          if (!scope) {
            scope = $rootScope;
          }
          events.forEach(function (eventName) {
            var prefixed = prefix + eventName;
            var forwardEvent = asyncAngularify(function (data) {
              scope.$broadcast(prefixed, data);
            });
            scope.$on('$destroy', function () {
              socket.removeListener(eventName, forwardEvent);
            });
            socket.on(eventName, forwardEvent);
          });
        }
      };

      return wrappedSocket;
    };

    this.prefix = function (newPrefix) {
      prefix = newPrefix;
    };

    this.ioSocket = function (socket) {
      ioSocket = socket;
    };
  });
