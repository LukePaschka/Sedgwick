four51.app.controller('SpecFormCtrl', ['$451', '$scope', '$location', '$route', '$routeParams', '$window', 'ProductDisplayService', 'Variant', 'AlliantResource',
function ($451, $scope, $location, $route, $routeParams, $window, ProductDisplayService, Variant, AlliantResource) {
	var isBC = false;
	var phoneSpecArray = ['V05_Direct', 'V06_Cell', 'V07_Office', 'V08_TollFree', 'V05_Office', 'V06_Direct', 'V07_Cell', 'V09_Fax', 'V06_Mobile', 'V07_TollFree'];
	$scope.A_BCoptions = $scope.tree[0].SubCategories[1].SubCategories[0].SubCategories.concat($scope.tree[0].SubCategories[1].SubCategories[1].SubCategories).concat($scope.tree[0].SubCategories[0].SubCategories[2].SubCategories).concat($scope.tree[0].SubCategories[0].SubCategories[3].SubCategories);
	$scope.variantErrors = [];
	var varID = $routeParams.variantInteropID == 'new' ? null :  $routeParams.variantInteropID;
	$scope.loadingImage = true;
	ProductDisplayService.getProductAndVariant($routeParams.productInteropID, varID, function(data){
		$scope.Product = data.product;
		if ($scope.Product.StaticSpecGroups.ProductBucket &&
			$scope.Product.StaticSpecGroups.ProductBucket.Specs.Bucket &&
			$scope.Product.StaticSpecGroups.ProductBucket.Specs.Bucket.Value == 'Business Cards') {
			isBC = true;
		} else {
			isBC = false;
		}
		if (isBC) {
			$scope.alliantNames = AlliantResource.alliantNames[$scope.Product.ExternalID];
		}
		if(varID) {
			$scope.Variant = data.variant;
			if (isBC) {
				angular.forEach($scope.Variant.Specs, function(spec){
					if (phoneSpecArray.indexOf(spec.Name) > -1) {
						$scope.Variant.Specs[spec.Name].Value = spec.Value.split(' ').join('');
					}
				});
				$scope.Variant.PreferredName = null;
				$scope.choice = {};
				if ($scope.Variant.Specs.V04a_Group && $scope.Variant.Specs.V04a_Group.Value == '') {
					$scope.Variant.Specs.V04a_Group.Value = 'Alliant Americas';
				}
				if ($scope.Variant.Specs.V08_Email) {
					var emailSpec = $scope.Variant.Specs.V08_Email.Value
				} else {
					var emailSpec = $scope.Variant.Specs.V10_Email.Value
				}
				angular.forEach($scope.alliantNames, function(person){
					if (person.Email == emailSpec){
						$scope.choice = person;
						if ($scope.choice.Name != $scope.Variant.Specs.V01_Name.Value) {
							$scope.Variant.PreferredName = $scope.Variant.Specs.V01_Name.Value.split(' ')[0];
							$scope.OverrideName = true;
						}
					}
				});
				if ($scope.Variant.Specs.V03_Title1.Value == '' && $scope.Variant.Specs.V04_Title2.Value != '') {
					$scope.Variant.TitleChoice = 'Title2';
				} else if ($scope.Variant.Specs.V04_Title2 == '' && $scope.choice.Title2 != '') {
					$scope.Variant.TitleChoice = 'Title1';
				} else if($scope.Variant.Specs.V03_Title1.Value != '' && $scope.Variant.Specs.V04_Title2.Value == ''){
					$scope.Variant.TitleChoice = 'Title1';
				} else {
					$scope.Variant.TitleChoice = 'Both';
				}
//				angular.forEach($scope.Variant.Specs, function(s){
//					switch(s.Name) {
//						case 'V01_Name':
//							$scope.choice.Name = s.Value;
//							break;
//						case 'V03_Title1':
//							$scope.choice.Title1 = s.Value;
//							break;
//						case 'V04_Title2':
//							$scope.choice.Title2 = s.Value;
//							break;
//						case 'V04a_Group':
//							$scope.choice.Group = $scope.Product.ExternalID == "AA_BC" ? 'Alliant Americas' :s.Value;
//							break;
//						case 'LocationSelection':
//							$scope.choice.Location = s.Value;
//							break;
//						case 'V08_Email':
//							$scope.choice.Email = s.Value;
//							break;
//						default :
//							break;
//					}
//				});
			}
		}

		else{
			$scope.Variant = {};
			$scope.Variant.PreferredName = null;
			$scope.Variant.TitleChoice = 'Both';
			$scope.Variant.ProductInteropID = $scope.Product.InteropID;
			$scope.Variant.Specs = {};
			angular.forEach($scope.Product.Specs, function(item){
				if(!item.CanSetForLineItem)
				{
					$scope.Variant.Specs[item.Name] = item;
				}
				if($scope.Product.ExternalID == 'A_BC_RS' && item.Name == 'V04a_Group') {
					$scope.Variant.Specs[item.Name].Value = 'Alliant Retirement Services'
				}
			});
		}
	});
	function validateVariant(){
		if(!$scope.Variant) return;
		var newErrors = [];
		angular.forEach($scope.Variant.Specs, function(s){
			if(s.Required && !s.Value && !isBC)
				newErrors.push(s.Label || s.Name + ' is a required field');
		});
		$scope.variantErrors = newErrors;
	}
	$scope.$watch('Variant.Specs', function(o, n){
		validateVariant();
	}, true);
	function saveVariant(variant, saveNew, hideErrorAlert /*for compatibility*/) {
		if($scope.variantErrors.length){
			$scope.showVariantErrors = true;
			if(!hideErrorAlert)
				$window.alert("please fill in all required fields"); //the default spec form should be made to deal with showing $scope.variantErrors, but it's likely existing spec forms may not deal with $scope.variantErrors
			return;
		}
		if(saveNew) $scope.Variant.InteropID = null;
		Variant.save(variant, function(data){
			$scope.variantSaveLoading = false;
			$location.path('/product/' + $scope.Product.InteropID + '/'+ data.InteropID);
		});
	}

	var buildVariant = function() {
		angular.forEach($scope.Variant.Specs, function(spec){
			if (phoneSpecArray.indexOf(spec.Name) > -1) {
				var phoneA = spec.Value.substring(0,3);
				var phoneB = spec.Value.substring(3,6);
				var phoneC = spec.Value.substring(6,10);
				$scope.Variant.Specs[spec.Name].Value = phoneA + ' ' + phoneB + ' ' + phoneC;
			}
		});
		if ($scope.Product.ExternalID == 'AA_BC' && $scope.Variant.Specs.V04a_Group.Value == "Alliant Americas") {
			$scope.Variant.Specs.V04a_Group.Value = '';
		}
		if ($scope.Variant.Specs.LocationSelection) {
			$scope.Variant.Specs.LocationSelection.Value = $scope.choice.Location;
		}
		if ($scope.Variant.Specs.V01_Name) {
			$scope.Variant.Specs.V01_Name.Value = $scope.Variant.PreferredName ? ($scope.Variant.PreferredName + ' ' + $scope.choice.Name.split(' ')[($scope.choice.Name.split(' ').length - 1)]) : $scope.choice.Name;
		}
		if ($scope.Variant.Specs.V03_Title1) {
			if ($scope.Variant.TitleChoice == 'Both' || $scope.Variant.TitleChoice == 'Title1') {
				$scope.Variant.Specs.V03_Title1.Value = $scope.choice.Title1;
			} else {
				$scope.Variant.Specs.V03_Title1.Value = '';
			}
		}
		if ($scope.Variant.Specs.V04_Title2) {
			if ($scope.Variant.TitleChoice == 'Both' || $scope.Variant.TitleChoice == 'Title2') {
				$scope.Variant.Specs.V04_Title2.Value = $scope.choice.Title2;
			} else {
				$scope.Variant.Specs.V04_Title2.Value = '';
			}
		}
		if ($scope.Variant.Specs.V08_Email) {
			$scope.Variant.Specs.V08_Email.Value = $scope.choice.Email;
		}
		if ($scope.Variant.Specs.V10_Email) {
			$scope.Variant.Specs.V10_Email.Value = $scope.choice.Email;
		}
	};

	$scope.save = function(hideErrorWindowAlert){
		$scope.variantSaveLoading = true;
		if (isBC) {
			buildVariant();
		}
		saveVariant($scope.Variant, false, hideErrorWindowAlert);
	};

	$scope.saveasnew = function(hideErrorAlert) {
		$scope.variantSaveLoading = true;
		if (isBC) {
			buildVariant();
		}
		saveVariant($scope.Variant, true, hideErrorAlert);
	};

	$scope.$on('event:imageLoaded', function(event, result) {
		$scope.loadingImage = !result;
		$scope.$apply();
	});
}]);