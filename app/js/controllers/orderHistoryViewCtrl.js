four51.app.controller('OrderViewCtrl', ['$scope', '$location', '$routeParams', 'Order', 'FavoriteOrder', 'Address', 'User', 'LineItems',
function ($scope, $location, $routeParams, Order, FavoriteOrder, Address, User, LineItems) {
	$scope.loadingIndicator = true;

    $scope.shippers = store.get("451Cache.GCShippers") ? store.get("451Cache.GCShippers") : [];

	Order.get($routeParams.id, function(data){
		$scope.loadingIndicator = false;
        $scope.order = data;
        LineItems.groupOrderHistory($scope.order);
        $scope.hasSpecsOnAnyLineItem = false;
		for(var i = 0; i < data.LineItems.length ; i++) {
			if (data.LineItems[i].Specs) {
				$scope.hasSpecsOnAnyLineItem = true;
				break;
			}
		}

		/*if ($scope.order.IsMultipleShip()) {
	        angular.forEach(data.LineItems, function(item) {
	            if (item.ShipAddressID) {
	                Address.get(item.ShipAddressID, function(add) {
	                    item.ShipAddress = add;
	                });
	            }
	        });
		}
		else {
			Address.get(data.ShipAddressID || data.LineItems[0].ShipAddressID, function(add) {
				data.ShipAddress = add;
			});
		}*/

        angular.forEach(data.LineItems, function(item) {
            if (item.ShipperID && !item.ShipperName) {
                angular.forEach($scope.shippers, function(s) {
                    if (s.ID == item.ShipperID) {
                        item.ShipperName = s.Name;
                    }
                });
            }
        });

        Address.get(data.BillAddressID, function(add){
            data.BillAddress = add;
        });
	});

	$scope.saveFavorite = function(callback) {
		$scope.displayLoadingIndicator = true;
		$scope.errorMessage = null;
        $scope.actionMessage = null;
        FavoriteOrder.save($scope.order,
		    function() {
		        $scope.displayLoadingIndicator = false;
	            if (callback) callback($scope.order);
	            $scope.actionMessage = "Your order has been saved as a Favorite";
	        },
	        function(ex) {
		        $scope.errorMessage = ex.Message;
	        }
        );
	};

    $scope.repeatOrder = function() {
	    $scope.errorMessage = null;
	    $scope.errorMessage = null;
        $scope.order.Repeat = true;
        Order.save($scope.order,
	        function(data) {
	            $scope.currentOrder = data;
	            $scope.user.CurrentOrderID = data.ID;
	            User.save($scope.user, function(data){
	                $scope.user = data;
	                $location.path('/cart');
	            });
            },
	        function(ex) {
				$scope.errorMessage = ex.Message;
	        }
        );
    };

    $scope.onPrint = function()  {
        window.print();
    };
}]);