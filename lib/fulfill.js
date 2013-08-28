var util = require("util");

if (typeof setImmediate != "function") {
	function setImmediate(cb) {
		process.nextTick(cb);
	}
}

module.exports = Promise;

function Promise(run_cb) {
	var fulfill_cb = [];
	var reject_cb  = [];
	var next_cb    = [];
	var state      = "pending";
	var value      = undefined;
	var P          = {
		then : function (onFulfilled, onRejected) {
			fulfill_cb.push(onFulfilled);
			reject_cb.push(onRejected);
			next_cb.push(new Promise());

			if (state == "fulfilled") {
				setImediate(fulfill);
			} else if (state == "rejected") {
				setImediate(reject);
			}

			return next_cb[next_cb.length - 1];
		}
	};
	Object.defineProperty(P, "fulfill", {
		value: function () {
			if (state != "pending") return;

			state = "fulfilled";
			value = Array.prototype.slice.apply(arguments);

			return fulfill();
		},
		enumerable: false
	});
	Object.defineProperty(P, "reject", {
		value: function (reason) {
			if (state != "pending") return;

			state = "rejected";
			value = util.isError(reason) ? reason : new Error(reason);

			return reject();
		},
		enumerable: false
	});
	Object.defineProperty(P, "state", {
		get: function () {
			return state;
		},
		enumerable: true
	});

	if (typeof run_cb == "function") {
		setImmediate(function () {
			run_cb.apply(P, [ P ]);
		});
	}

	return P;

	function pass_ret(ret, next_cb) {
		if (ret && typeof ret.then == "function") {
			ret.then(next_cb.fulfill, next_cb.reject);
		} else if (util.isError(ret)) {
			next_cb.reject(ret);
		} else {
			next_cb.fulfill.apply(next_cb, ret);
		}
	};
	function fulfill() {
		for (var i = 0; i < next_cb.length; i++) {
			if (typeof fulfill_cb[i] != "function") continue;

			try {
				var ret = fulfill_cb[i].apply(null, value);
			} catch (ex) {
				pass_ret(ex, next_cb[i]);
				continue;
			}

			pass_ret(ret, next_cb[i]);
		}
	};
	function reject() {
		for (var i = 0; i < next_cb.length; i++) {
			if (typeof reject_cb[i] != "function") continue;

			try {
				var ret = reject_cb[i](value);
			} catch (ex) {
				pass_ret(ex, next_cb[i]);
				continue;
			}
			pass_ret(ret, next_cb[i]);
		}
	};
}
