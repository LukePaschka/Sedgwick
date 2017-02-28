four51.app.factory('Category', ['$resource', '$451', function($resource, $451) {
    function _then(fn, data) {
        if (angular.isFunction(fn))
            fn(data);
    }

    var _get = function(interopID, success) {
		var category = store.get('451Cache.Category.' + interopID);
        category ? _then(success,category) :
            $resource($451.api('categories/:interopID', {interopID: '@ID'})).get({ 'interopID': interopID}).$promise.then(function(category) {
	            store.set('451Cache.Category.' + category.InteropID, category);
                _then(success, category);
            });
    }

	var _treeCacheName = '451Cache.Tree.' + $451.apiName;
    var _query = function(success){
		var tree = store.get(_treeCacheName);
        tree ? _then(success,tree) :
            $resource($451.api('categories'), {}, { query: { method: 'GET', isArray: true }}).query().$promise.then(function(tree){
                store.set(_treeCacheName, tree);
               _then(success, tree);
            });
    }

    return {
        tree: _query,
        get: _get
    }
}]);

four51.app.factory('AlliantNav', ['$resource', '$451', function($resource, $451) {
	var service = {
		get: _get
	};
	return service;

//	function _get(success) {
//		success([
//			{
//				'Name': 'Stationery Item',
//				'Description': '',
//				'InteropID': 'StationeryItem',
//				'Level': 'top',
//				'SubCategories': [
//					{
//						'Name': 'Operating Groups',
//						'Description': '',
//						'InteropID': 'OperatingGroups',
//						'Level': 'group',
//						'SubCategories': [
//							{
//								'Name': 'Alliant Americas',
//								'Description': '',
//								'InteropID': 'AlliantAmericas',
//								'Level': 'subgroup',
//								'SubCategories': [
//									{
//										'Name': 'Alliant Retirement Services',
//										'Description': '',
//										'InteropID': 'AlliantRetirementServices',
//										'Level': 'nav'
//									},
//									{
//										'Name': 'Alliant Employee Benefits',
//										'Description': '',
//										'InteropID': 'AlliantEmployeeBenefits',
//										'Level': 'nav'
//									}
//								]
//							}
//						]
//					}
//				]
//			},
//			{
//				'Name': 'Holiday Cards',
//				'Description': '',
//				'InteropID': 'HolidayCards',
//				'Level': 'top',
//				'SubCategories': [
//					{
//						'Name': null,
//						'Description': '',
//						'InteropID': '',
//						'Level': 'group',
//						'SubCategories': [
//							{
//								'Name': 'Alliant (All groups except EB)',
//								'Description': '',
//								'InteropID': 'AlliantAll',
//								'Level': 'subgroup',
//								'SubCategories': []
//							}
//						]
//					}
//				]
//			}
//		]);
//	}

	var _treeCacheName = '451Cache.Tree.' + $451.apiName;

	function _get(success) {
		var val = function(tree) {
			var struct = [];
			angular.forEach(tree, function(node) {
				var root = {
					'Name': node.Name,
					'InteropID': node.InteropID,
					'Level': node.InteropID.split('_')[1],
					'SubCategories': parse(node)
				};
				struct.push(root);
			});
			success(struct);
		};
		query(val);
	}


	function parse(item) {
		var struct = [], empty = null;

		if (item.InteropID.indexOf('_top') > -1) {
			if (item.SubCategories[0].InteropID.indexOf('_group') == -1) {
				struct.push({
					'Name': null,
					'Level': 'group',
					'SubCategories': []
				});
				empty = struct;
			}
		}

		angular.forEach(item.SubCategories, function(node) {
			var o = {
				'Name': node.Name,
				'InteropID': node.InteropID,
				'Level': node.InteropID.split('_')[1],
				'SubCategories': parse(node)
			};
			if (empty)
				empty[0].SubCategories.push(o);
			else
				struct.push(o);
		});
		return struct;
	}

	function query(success) {
//		var tree = store.get(_treeCacheName);
//		tree ? success(tree) :
			$resource($451.api('categories'), {}, { query: { method: 'GET', isArray: true }}).query().$promise.then(function(tree){
				store.set(_treeCacheName, tree);
				success(tree);
			});
	}

}]);

four51.app.factory('ProductBucket', function() {
	var _makeBuckets = function(products, success) {
		var productBuckets = [];
		angular.forEach(products, function(p){
			var exists = false;
			var bucket = {
				Name: p.StaticSpecGroups ? p.StaticSpecGroups.ProductBucket.Specs.Bucket.Value : 'null',
				Products:[p]
			};
			angular.forEach(productBuckets,function(b){
				if(b.Name == bucket.Name)
					exists = true;
			});
			if (!exists){
				productBuckets.push(bucket);
			} else {
				angular.forEach(productBuckets,function(b){
					if(p.StaticSpecGroups && (p.StaticSpecGroups.ProductBucket.Specs.Bucket.Value == b.Name))
						b.Products.push(p);
				});
			}
		});
		success(productBuckets);
	};

	return {
		makeBuckets: _makeBuckets
	};
});