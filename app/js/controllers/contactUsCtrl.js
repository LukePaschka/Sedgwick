four51.app.controller('ContactUsCtrl', ['$scope', 'Message',
function($scope, Message) {
	$scope.messageSent = false;

	$scope.message = {};

	$scope.send = function(event) {
		$scope.message.Subject = 'CUSTOMER INQUIRY - '+$scope.message.Subject;
        Message.save($scope.message, function() {
			$scope.message = {};
			$scope.messageSent = true;
		});
	}
}]);