// public/core.js
var scotchTodo = angular.module('scotchTodo', []).controller('mainController',['$scope','$http','$timeout','socketio',function ($scope,$http,$timeout,socketio){
      socketio.on('todoemit', function(data) {
$scope.$apply(function(){
console.log('todoemit');
console.log(data.msg);
console.log('iscope.todos');
console.log($scope.todos);
//$scope.formData = {};
$scope.todos=data.msg;
console.log($scope.todos);
//$scope.todos.append('test insert');
     });	
});
 $scope.formData = {};

    // when landing on the page, get all todos and show them
// when landing on the page, get all todos and show them
    $http.get('/api/todos')
        .success(function(data) {
            $scope.todos = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });

    // when submitting the add form, send the text to the node API
    $scope.createTodo = function() {
        $http.post('/api/todos', $scope.formData)
            .success(function(data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
                $scope.todos = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

    // delete a todo after checking it
    $scope.deleteTodo = function(id) {
        $http.delete('/api/todos/' + id)
            .success(function(data) {
                $scope.todos = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };


}]);   

scotchTodo.factory('socketio', ['$rootScope', function($rootScope) {
  var socket = io.connect("http://localhost:8080");

  return {
    on: function(eventName, callback){
      socket.on(eventName, callback);
    },
    emit: function(eventName, data) {
      socket.emit(eventName, data);
    }
  }
}]);

