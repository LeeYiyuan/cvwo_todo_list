var app = angular.module('todoApp', []);
app.filter('tagfilter', function() {
    return function(items, query) {
        if (query === undefined || query === '' || query === null) {
            return items;
        }

        var queryTagsArray = query.split(' ');
        return items.filter(function(item) {
            var itemTagsArray = item.tags === undefined || item.tags === null ? [] : item.tags.split(' ');
            return queryTagsArray.every(x => itemTagsArray.some(y => y.indexOf(x) >= 0));
        });
    };
});
app.controller('TodoController', function ($scope) {
    // Helper function to call API method.
    function ajax(type, target, data, callback) {
        var settings = {};
        settings.type = type;
        settings.url = '/api/' + target;
        settings.cache = false;
        settings.contentType = 'application/json';
        settings.data = JSON.stringify(data);
        settings.dataType = 'json';
        settings.success = callback;
        $.ajax(settings);
    }

    // Gets current list key.
    function getKey() {
        return Cookies.get('key');
    }

    // Sets current list key.
    function setKey(key) {
        Cookies.set('key', key);
    }

    // Convert date fields in JSON objects from string to Date.
    function parseItem(item) {
        if (item.deadline !== null && item.deadline !== undefined) {
            item.deadline = new Date(item.deadline);
        }
    }

    function createList(callback = function() { }) {
        ajax('POST', 'lists', undefined, function(result) {
            if ('error' in result) {
                callback(result.error);
            } else {
                setKey(result.key);
                $scope.items = [];
                $scope.$apply();
                callback();
            }
        });
    }

    function loadList(callback = function() { }) {
        ajax('GET', 'lists/' + getKey() + '/items', undefined, function(result) {
            if ('error' in result) {
                callback(result.error);
            } else {
                for (var i = 0; i < result.items.length; i++) {
                    parseItem(result.items[i]);
                }
                $scope.items = result.items;
                $scope.$apply();
                callback();
            }
        });
    }

    // Handler for creating an item.
    $scope.createItem = function() {
        $scope.createItemTitle = null;
        $scope.createItemDetails = null;
        $scope.createItemTags = null;

        $('.todo-create-item-modal').modal({ 
            duration: 200,
            inverted: true,
            onApprove: function() {
                $scope.createItemIsCreating = true;
                $scope.$digest(); // Force update
                var item = {
                    title: $scope.createItemTitle,
                    details: $scope.createItemDetails,
                    deadline: $('.todo-create-item-modal .ui.calendar').calendar('get date')[0],
                    tags: $scope.createItemTags
                };
                ajax('POST', 'lists/' + Cookies.get('key') + '/items', item, function(result) {
                    if (!('error' in result)){
                        parseItem(result.item);
                        $scope.items.push(result.item);
                        $scope.$apply();
                    }
                    $scope.createItemIsCreating = false;
                    $scope.$digest();
                    $('.todo-create-item-modal').modal('hide');
                });
                
                return false;
            }
        });
        $('.todo-create-item-modal .ui.calendar').calendar({
            type: 'datetime',
            today: true
        });
        $('.todo-create-item-modal .ui.calendar').calendar('set date', null);
        $('.todo-create-item-modal').modal('show');
    };

    // Handler for editing an item.
    $scope.editItem = function(item) {
        $scope.editItemTitle = item.title;
        $scope.editItemDetails = item.details;
        $scope.editItemTags = item.tags;

        $('.todo-edit-item-modal').modal({
            duration: 200,
            inverted: true,
            onApprove: function() {
                $scope.editItemIsSaving = true;
                $scope.$digest(); // Force update
                item.title = $scope.editItemTitle;
                item.deadline = $('.todo-edit-item-modal .ui.calendar').calendar('get date')[0];
                item.details = $scope.editItemDetails;
                item.tags = $scope.editItemTags;
    
                ajax('PATCH', 'lists/' + getKey() + '/items/' + item.id, item, function(result) {
                    if (!('error' in result)){
                        $scope.$apply();
                    }
                    $scope.editItemIsSaving = false;
                    $scope.$digest();
                    $('.todo-edit-item-modal').modal('hide');
                });

                return false;
            }
        });
        $('.todo-edit-item-modal .ui.calendar').calendar({
            type: 'datetime',
            today: true
        });
        $('.todo-edit-item-modal .ui.calendar').calendar('set date', item.deadline);
        $('.todo-edit-item-modal').modal('show');
    };

    // Handler for deleting an item.
    $scope.deleteItem = function(item) {
        item.isDeleting = true;
        ajax('DELETE', 'lists/' + getKey() + '/items/' + item.id, undefined, function(result) {
            if (!('error' in result)) {
                $scope.items.splice($scope.items.indexOf(item), 1);
                $scope.$apply();
            }
            item.isDeleting = false;
        });
    };

    if (getKey() === undefined || getKey() === null) {
        createList();
    } else {
        loadList(function(error) {
            if (error === 'LIST_NOT_FOUND') {
                createList();
            }
        });
    }
});